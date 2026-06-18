import {
  DEFAULT_DAEMON_HOST,
  DEFAULT_DAEMON_PORT,
  type ExtensionRpc,
  type bookmarks,
  findNodeByPath,
  ensurePath,
  getFoldersFromTree,
} from '@bb/shared'
import { errorMessage } from '@bb/shared'

import { daemonWebSocketUrl } from './url.js'

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
    return chrome.bookmarks.getTree()
  },
  async getFolders() {
    const tree = await chrome.bookmarks.getTree()
    return getFoldersFromTree(tree)
  },
  async search(query) {
    return chrome.bookmarks.search(query)
  },
  async get(id) {
    return chrome.bookmarks.get(id)
  },
  async getChildren(id) {
    return chrome.bookmarks.getChildren(id)
  },
  async create(params) {
    return chrome.bookmarks.create(params)
  },
  async update(id, changes) {
    return chrome.bookmarks.update(id, changes)
  },
  async move(id, changes) {
    return chrome.bookmarks.move(id, changes)
  },
  async moveByPath(id, path, index) {
    const tree = await chrome.bookmarks.getTree()
    const target = await ensurePath(tree, path, async (params) => chrome.bookmarks.create(params))
    const moveOptions: { parentId: string; index?: number } = { parentId: target.id }
    if (index !== undefined) moveOptions.index = index
    return chrome.bookmarks.move(id, moveOptions)
  },
  async moveByPathBatch(items) {
    const tree = await chrome.bookmarks.getTree()
    const createFolder = async (params: { parentId: string; title: string }) =>
      chrome.bookmarks.create(params)
    const moved: bookmarks.BookmarkTreeNode[] = []
    for (const item of items) {
      const target = await ensurePath(tree, item.path, createFolder)
      const moveOptions: { parentId: string; index?: number } = { parentId: target.id }
      if (item.index !== undefined) moveOptions.index = item.index
      moved.push(await chrome.bookmarks.move(item.id, moveOptions))
    }
    return moved
  },
  async remove(id) {
    await chrome.bookmarks.remove(id)
  },
  async removeTree(id) {
    await chrome.bookmarks.removeTree(id)
  },
  async removeByPath(path) {
    const tree = await chrome.bookmarks.getTree()
    const node = findNodeByPath(tree, path)
    if (!node) {
      throw new Error(`Path not found: ${path}`)
    }
    await chrome.bookmarks.removeTree(node.id)
  },
  async getTabs(query) {
    return chrome.tabs.query(query ?? {})
  },
  async createTab(params) {
    return chrome.tabs.create(params ?? {})
  },
  async reloadTab(tabId, bypassCache) {
    await chrome.tabs.reload(tabId, { bypassCache })
  },
  async closeTab(tabId) {
    await chrome.tabs.remove(tabId)
  },
  async activateTab(tabId) {
    return chrome.tabs.update(tabId, { active: true })
  },
  async updateTab(tabId, changes) {
    return chrome.tabs.update(tabId, changes)
  },
  async duplicateTab(tabId) {
    return chrome.tabs.duplicate(tabId)
  },
  async moveTab(tabId, moveProperties) {
    return chrome.tabs.move(tabId, moveProperties)
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
