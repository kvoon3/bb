import type { WebSocket } from 'ws'
import { createBirpc, type BirpcReturn } from 'birpc'
import {
  EXTENSION_WS_PATH,
  type BookmarkCommand,
  type ExtensionRpc,
  type RpcResponse,
} from '@bb/protocol'
import { errorMessage } from '@bb/utils'
import { host, port, requestTimeoutMs } from './config.js'

let extensionSocket: WebSocket | undefined
let extensionRpc: BirpcReturn<ExtensionRpc> | undefined
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
  extensionRpc?.$close()

  extensionSocket = webSocket
  extensionOrigin = request.headers.origin
  extensionRpc = createBirpc<ExtensionRpc, Record<string, never>>(
    {},
    {
      post(data) {
        webSocket.send(data)
      },
      on(fn) {
        webSocket.on('message', fn)
      },
      off(fn) {
        webSocket.off('message', fn)
      },
      serialize: JSON.stringify,
      deserialize(data) {
        return JSON.parse(String(data))
      },
      timeout: requestTimeoutMs,
    },
  )

  webSocket.on('close', function () {
    if (extensionSocket === webSocket) {
      extensionSocket = undefined
      extensionRpc = undefined
      extensionOrigin = undefined
    }
  })
}

const commandHandlers: {
  [K in BookmarkCommand['method']]: (
    rpc: BirpcReturn<ExtensionRpc>,
    command: Extract<BookmarkCommand, { method: K }>,
  ) => Promise<unknown>
} = {
  'bookmarks.tree': (rpc) => rpc.getTree(),
  'bookmarks.search': (rpc, command) => rpc.search(command.params.query),
  'bookmarks.get': (rpc, command) => rpc.get(command.params.id),
  'bookmarks.children': (rpc, command) => rpc.getChildren(command.params.id),
  'bookmarks.create': (rpc, command) => rpc.create(command.params),
  'bookmarks.update': (rpc, command) => {
    const { id, ...changes } = command.params
    return rpc.update(id, changes)
  },
  'bookmarks.move': (rpc, command) => {
    const { id, ...changes } = command.params
    return rpc.move(id, changes)
  },
  'bookmarks.remove': (rpc, command) => rpc.remove(command.params.id),
  'bookmarks.removeTree': (rpc, command) => rpc.removeTree(command.params.id),
}

export async function sendToExtension(command: BookmarkCommand): Promise<RpcResponse> {
  if (!extensionRpc || !extensionSocket || extensionSocket.readyState !== extensionSocket.OPEN) {
    return { ok: false, error: 'Browser extension is not connected' }
  }

  try {
    const result = await commandHandlers[command.method](extensionRpc, command as never)
    return { ok: true, result }
  } catch (error) {
    return { ok: false, error: errorMessage(error) }
  }
}
