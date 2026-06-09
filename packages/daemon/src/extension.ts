import { randomUUID } from 'node:crypto'
import type { WebSocket } from 'ws'
import {
  EXTENSION_WS_PATH,
  type BookmarkCommand,
  type ExtensionRequest,
  type RpcResponse,
} from '@bb/protocol'
import { host, port, requestTimeoutMs } from './config.js'
import { parseExtensionResponse } from './utils.js'

let extensionSocket: WebSocket | undefined
let extensionOrigin: string | undefined

export function getExtensionState() {
  return {
    connected: extensionSocket !== undefined && extensionSocket.readyState === extensionSocket.OPEN,
    origin: extensionOrigin,
  }
}

export function isWebSocketPath(url: string): boolean {
  return new URL(url, `http://${host}:${port}`).pathname === EXTENSION_WS_PATH
}

export function handleWebSocketConnection(
  webSocket: WebSocket,
  request: { headers: { origin?: string } },
) {
  extensionSocket?.close(1012, 'Replaced by a newer extension connection')
  extensionSocket = webSocket
  extensionOrigin = request.headers.origin

  webSocket.on('close', () => {
    if (extensionSocket === webSocket) {
      extensionSocket = undefined
      extensionOrigin = undefined
    }
  })
}

export async function sendToExtension(command: BookmarkCommand): Promise<RpcResponse> {
  if (!extensionSocket || extensionSocket.readyState !== extensionSocket.OPEN) {
    return { ok: false, error: 'Browser extension is not connected' }
  }

  const socket = extensionSocket
  const id = randomUUID()
  const message: ExtensionRequest = { id, type: 'request', ...command }

  return await new Promise<RpcResponse>((resolve) => {
    const timeout = setTimeout(() => {
      cleanup()
      resolve({ ok: false, error: 'Timed out waiting for browser extension' })
    }, requestTimeoutMs)

    const handleMessage = (data: WebSocket.RawData) => {
      const response = parseExtensionResponse(data)
      if (!response || response.id !== id) {
        return
      }

      cleanup()
      resolve(
        response.ok ? { ok: true, result: response.result } : { ok: false, error: response.error },
      )
    }

    const handleClose = () => {
      cleanup()
      resolve({ ok: false, error: 'Browser extension disconnected' })
    }

    const cleanup = () => {
      clearTimeout(timeout)
      socket.off('message', handleMessage)
      socket.off('close', handleClose)
    }

    socket.on('message', handleMessage)
    socket.on('close', handleClose)
    socket.send(JSON.stringify(message))
  })
}
