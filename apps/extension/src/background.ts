import {
  DEFAULT_DAEMON_HOST,
  DEFAULT_DAEMON_PORT,
  daemonWebSocketUrl,
  type ExtensionRequest,
  type ExtensionResponse,
} from '@bb/protocol'

const reconnectDelayMs = 1_500
const daemonUrl = daemonWebSocketUrl(DEFAULT_DAEMON_PORT, DEFAULT_DAEMON_HOST)

let socket: WebSocket | undefined

ensureConnected()

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'status') {
    ensureConnected()
    sendResponse({ connected: socket?.readyState === WebSocket.OPEN, daemonUrl })
  }
})

function ensureConnected() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  ) {
    return
  }

  connect()
}

function connect() {
  socket = new WebSocket(daemonUrl)

  socket.addEventListener('message', async (event) => {
    const response = await handleRequest(parseRequest(event.data))
    socket?.send(JSON.stringify(response))
  })

  socket.addEventListener('close', () => {
    setTimeout(ensureConnected, reconnectDelayMs)
  })

  socket.addEventListener('error', () => {
    socket?.close()
  })
}

async function handleRequest(request: ExtensionRequest | undefined): Promise<ExtensionResponse> {
  if (!request) {
    return { id: 'unknown', type: 'response', ok: false, error: 'Invalid request' }
  }

  try {
    switch (request.method) {
      case 'bookmarks.tree':
        return { id: request.id, type: 'response', ok: true, result: await getTree() }
      case 'bookmarks.search':
        return {
          id: request.id,
          type: 'response',
          ok: true,
          result: await search(request.params.query),
        }
      case 'bookmarks.get':
        return { id: request.id, type: 'response', ok: true, result: await get(request.params.id) }
      case 'bookmarks.children':
        return {
          id: request.id,
          type: 'response',
          ok: true,
          result: await getChildren(request.params.id),
        }
    }
  } catch (error) {
    return { id: request.id, type: 'response', ok: false, error: errorMessage(error) }
  }
}

function getTree() {
  return chrome.bookmarks.getTree()
}

function search(query: string) {
  return chrome.bookmarks.search(query)
}

function get(id: string) {
  return chrome.bookmarks.get(id)
}

function getChildren(id: string) {
  return chrome.bookmarks.getChildren(id)
}

function parseRequest(data: unknown): ExtensionRequest | undefined {
  try {
    const parsed = JSON.parse(String(data)) as ExtensionRequest
    return parsed.type === 'request' ? parsed : undefined
  } catch {
    return undefined
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
