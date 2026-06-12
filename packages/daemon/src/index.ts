import { createServer } from 'node:http'
import type { Server } from 'node:http'
import { WebSocketServer } from 'ws'
import { errorMessage } from '@bb/utils'
import { host, port } from './config.js'
import { handleWebSocketConnection, isWebSocketPath } from './extension.js'
import { routeHttp } from './routes.js'
import { writeJson } from './utils.js'

export interface DaemonInstance {
  server: Server
  wsServer: WebSocketServer
  url: string
  close: () => Promise<void>
}

export function startDaemon(options?: { host?: string; port?: number }): DaemonInstance {
  const h = options?.host ?? host
  const p = options?.port ?? port
  const url = `http://${h}:${p}`

  const server = createServer(async (request, response) => {
    try {
      await routeHttp(request, response, shutdown)
    } catch (error) {
      writeJson(response, 500, { ok: false, error: errorMessage(error) })
    }
  })

  const wsServer = new WebSocketServer({ noServer: true })

  server.on('upgrade', (request, socket, head) => {
    if (!isWebSocketPath(request.url ?? '/')) {
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
