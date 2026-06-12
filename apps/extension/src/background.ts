import {
  DEFAULT_DAEMON_HOST,
  DEFAULT_DAEMON_PORT,
  daemonWebSocketUrl,
  type BookmarkNode,
  type ExtensionRpc,
} from '@bb/protocol'
import { errorMessage } from '@bb/utils'

const offscreenPath = 'offscreen.html'
const offscreenUrl = chrome.runtime.getURL(offscreenPath)
const daemonUrl = daemonWebSocketUrl(DEFAULT_DAEMON_PORT, DEFAULT_DAEMON_HOST)

let offscreenConnected = false

chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
  if (message?.type === 'offscreen:rpc') {
    void handleRpc(message.method, message.args)
      .then((result) => sendResponse({ result }))
      .catch((error) => sendResponse({ error: errorMessage(error) }))
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
    void ensureOffscreenDocument().then(function () {
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

const rpcImpl: ExtensionRpc = {
  async getTree() {
    return chrome.bookmarks.getTree() as Promise<BookmarkNode[]>
  },
  async search(query) {
    return chrome.bookmarks.search(query) as Promise<BookmarkNode[]>
  },
  async get(id) {
    return chrome.bookmarks.get(id) as Promise<BookmarkNode[]>
  },
  async getChildren(id) {
    return chrome.bookmarks.getChildren(id) as Promise<BookmarkNode[]>
  },
  async create(params) {
    return chrome.bookmarks.create(params) as Promise<BookmarkNode>
  },
  async update(id, changes) {
    return chrome.bookmarks.update(id, changes) as Promise<BookmarkNode>
  },
  async move(id, changes) {
    return chrome.bookmarks.move(id, changes) as Promise<BookmarkNode>
  },
  async remove(id) {
    await chrome.bookmarks.remove(id)
  },
  async removeTree(id) {
    await chrome.bookmarks.removeTree(id)
  },
}

async function handleRpc<K extends keyof ExtensionRpc>(
  method: K,
  args: Parameters<ExtensionRpc[K]>,
): Promise<ReturnType<ExtensionRpc[K]>> {
  const fn = rpcImpl[method] as (
    ...args: Parameters<ExtensionRpc[K]>
  ) => ReturnType<ExtensionRpc[K]>
  return fn(...args)
}
