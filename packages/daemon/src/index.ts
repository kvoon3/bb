import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { host, port } from './config.js'
import { handleWebSocketConnection, isWebSocketPath } from './extension.js'
import { routeHttp } from './routes.js'
import { errorMessage, writeJson } from './utils.js'

const server = createServer(async (request, response) => {
  try {
    await routeHttp(request, response)
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

server.listen(port, host, () => {
  console.log(`bb daemon listening on http://${host}:${port}`)
})
