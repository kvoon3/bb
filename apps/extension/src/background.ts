import {
  DEFAULT_DAEMON_HOST,
  DEFAULT_DAEMON_PORT,
  daemonWebSocketUrl,
  type ExtensionRequest,
  type ExtensionResponse,
} from '@bb/protocol'

const reconnectDelayMs = 1_500
const keepAliveAlarmName = 'bb-keep-alive'
const keepAliveIntervalMinutes = 0.5
const daemonUrl = daemonWebSocketUrl(DEFAULT_DAEMON_PORT, DEFAULT_DAEMON_HOST)

let socket: WebSocket | undefined

ensureConnected()
startKeepAlive()

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'status') {
    ensureConnected()
    sendResponse({ connected: socket?.readyState === WebSocket.OPEN, daemonUrl })
  }
})

chrome.runtime.onStartup.addListener(startKeepAlive)
chrome.runtime.onInstalled.addListener(startKeepAlive)

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === keepAliveAlarmName) {
    ensureConnected()
  }
})

function startKeepAlive() {
  void chrome.alarms.create(keepAliveAlarmName, {
    delayInMinutes: keepAliveIntervalMinutes,
    periodInMinutes: keepAliveIntervalMinutes,
  })
}

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
      case 'bookmarks.create':
        return {
          id: request.id,
          type: 'response',
          ok: true,
          result: await create(request.params),
        }
      case 'bookmarks.update': {
        const { id: updateId, ...updateChanges } = request.params
        return {
          id: request.id,
          type: 'response',
          ok: true,
          result: await update(updateId, updateChanges),
        }
      }
      case 'bookmarks.move': {
        const { id: moveId, ...moveChanges } = request.params
        return {
          id: request.id,
          type: 'response',
          ok: true,
          result: await move(moveId, moveChanges),
        }
      }
      case 'bookmarks.remove':
        await remove(request.params.id)
        return { id: request.id, type: 'response', ok: true, result: undefined }
      case 'bookmarks.removeTree':
        await removeTree(request.params.id)
        return { id: request.id, type: 'response', ok: true, result: undefined }
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

function create(params: { parentId?: string; title?: string; url?: string; index?: number }) {
  return chrome.bookmarks.create(params)
}

function update(id: string, params: { title?: string; url?: string }) {
  return chrome.bookmarks.update(id, params)
}

function move(id: string, params: { parentId?: string; index?: number }) {
  return chrome.bookmarks.move(id, params)
}

function remove(id: string) {
  return chrome.bookmarks.remove(id)
}

function removeTree(id: string) {
  return chrome.bookmarks.removeTree(id)
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
