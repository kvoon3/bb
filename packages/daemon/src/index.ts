import { createServer } from 'node:http'
import type { Server } from 'node:http'

import { EXTENSION_WS_PATH } from '@bb/shared'
import {
  createApp,
  createError,
  defineEventHandler,
  send,
  setResponseHeader,
  setResponseStatus,
  toNodeListener,
} from 'h3'
import { WebSocketServer } from 'ws'

import { host as defaultHost, port as defaultPort } from './config.js'
import { createAppRouter, handleWebSocketConnection } from './routes.js'

export interface DaemonInstance {
  server: Server
  wsServer: WebSocketServer
  url: string
  close: () => Promise<void>
}

export function startDaemon(options?: { host?: string; port?: number }): DaemonInstance {
  const h = options?.host ?? defaultHost
  const p = options?.port ?? defaultPort
  const url = `http://${h}:${p}`

  const app = createApp({
    onError: (error, event) => {
      const h3Error = createError(error)
      setResponseStatus(event, h3Error.statusCode ?? 500)
      return send(event, h3Error.statusMessage || h3Error.message)
    },
  })

  app.use(
    defineEventHandler(async (event) => {
      setResponseHeader(event, 'access-control-allow-origin', '*')
    }),
  )

  app.use(createAppRouter(shutdown))

  const server = createServer(toNodeListener(app))
  const wsServer = new WebSocketServer({ noServer: true })

  server.on('upgrade', (request, socket, head) => {
    if (new URL(request.url ?? '/', url).pathname !== EXTENSION_WS_PATH) {
      socket.destroy()
      return
    }

    wsServer.handleUpgrade(request, socket, head, (webSocket) => {
      wsServer.emit('connection', webSocket, request)
    })
  })

  wsServer.on('connection', (webSocket, request) => {
    handleWebSocketConnection(webSocket, request)
  })

  server.listen(p, h, () => {
    console.log(`bb daemon listening on ${url}`)
  })

  const close = (): Promise<void> =>
    new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err)
        else resolve()
      })
      wsServer.clients.forEach((client) => client.terminate())
      wsServer.close()
    })

  function shutdown() {
    close()
      .then(() => process.exit(0))
      .catch(() => process.exit(1))
  }

  return { server, wsServer, url, close }
}
