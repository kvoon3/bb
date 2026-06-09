import {
  DEFAULT_DAEMON_HOST,
  DEFAULT_DAEMON_PORT,
  daemonWebSocketUrl,
  type ExtensionRequest,
  type ExtensionResponse,
} from '@bb/protocol'

const offscreenPath = 'offscreen.html'
const offscreenUrl = chrome.runtime.getURL(offscreenPath)
const daemonUrl = daemonWebSocketUrl(DEFAULT_DAEMON_PORT, DEFAULT_DAEMON_HOST)

let offscreenConnected = false

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'offscreen:request') {
    void handleOffscreenRequest(message.data).then(sendResponse)
    return true
  }

  if (message?.type === 'offscreen:connected') {
    offscreenConnected = true
    return false
  }

  if (message?.type === 'offscreen:disconnected') {
    offscreenConnected = false
    return false
  }

  if (message?.type === 'status') {
    void ensureOffscreenDocument().then(() => {
      sendResponse({ connected: offscreenConnected, daemonUrl })
    })
    return true
  }

  return false
})

chrome.runtime.onStartup.addListener(ensureOffscreenDocument)
chrome.runtime.onInstalled.addListener(ensureOffscreenDocument)

async function ensureOffscreenDocument(): Promise<void> {
  if (await hasOffscreenDocument()) {
    return
  }
  offscreenConnected = false
  await chrome.offscreen.createDocument({
    url: offscreenPath,
    reasons: [chrome.offscreen.Reason.WORKERS],
    justification: 'Maintain a persistent WebSocket connection to the local BB daemon',
  })
}

async function hasOffscreenDocument(): Promise<boolean> {
  if (typeof chrome.runtime.getContexts === 'undefined') {
    return false
  }
  const matches = await chrome.runtime.getContexts({})
  return matches.some(
    (context) =>
      context.contextType === 'OFFSCREEN_DOCUMENT' && context.documentUrl === offscreenUrl,
  )
}

async function handleOffscreenRequest(data: unknown): Promise<ExtensionResponse> {
  const request = parseRequest(data)
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
