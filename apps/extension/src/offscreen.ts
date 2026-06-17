import { DEFAULT_DAEMON_HOST, DEFAULT_DAEMON_PORT, type ExtensionRpc } from '@bb/shared'
import { createBirpc } from 'birpc'

import { daemonWebSocketUrl } from './url.js'

const reconnectDelayMs = 1_500
const daemonUrl = daemonWebSocketUrl(DEFAULT_DAEMON_PORT, DEFAULT_DAEMON_HOST)

let socket: WebSocket | undefined

connect()

function connect() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  ) {
    return
  }

  socket = new WebSocket(daemonUrl)

  socket.addEventListener('open', function () {
    void chrome.runtime.sendMessage({ type: 'offscreen:connected' })
  })

  socket.addEventListener('close', function () {
    void chrome.runtime.sendMessage({ type: 'offscreen:disconnected' })
    setTimeout(connect, reconnectDelayMs)
  })

  socket.addEventListener('error', function () {
    socket?.close()
  })

  const messageHandlers = new WeakMap<
    (data: any, ...extras: any[]) => void,
    (event: MessageEvent) => void
  >()

  createBirpc<Record<string, never>, ExtensionRpc>(
    {
      getTree() {
        return callBackground('getTree')
      },
      getFolders() {
        return callBackground('getFolders')
      },
      search(query) {
        return callBackground('search', query)
      },
      get(id) {
        return callBackground('get', id)
      },
      getChildren(id) {
        return callBackground('getChildren', id)
      },
      create(params) {
        return callBackground('create', params)
      },
      update(id, changes) {
        return callBackground('update', id, changes)
      },
      move(id, changes) {
        return callBackground('move', id, changes)
      },
      moveByPath(id, path, index) {
        return callBackground('moveByPath', id, path, index)
      },
      moveByPathBatch(items) {
        return callBackground('moveByPathBatch', items)
      },
      remove(id) {
        return callBackground('remove', id)
      },
      removeTree(id) {
        return callBackground('removeTree', id)
      },
      removeByPath(path) {
        return callBackground('removeByPath', path)
      },
    },
    {
      post(data) {
        socket?.send(data)
      },
      on(fn) {
        const handler = (event: MessageEvent) => fn(event.data)
        messageHandlers.set(fn, handler)
        socket?.addEventListener('message', handler)
      },
      off(fn) {
        const handler = messageHandlers.get(fn)
        if (handler) socket?.removeEventListener('message', handler)
      },
      serialize: JSON.stringify,
      deserialize(data) {
        return JSON.parse(String(data))
      },
    },
  )
}

async function callBackground<K extends keyof ExtensionRpc>(
  method: K,
  ...args: Parameters<ExtensionRpc[K]>
): Promise<Awaited<ReturnType<ExtensionRpc[K]>>> {
  const response = (await chrome.runtime.sendMessage({
    type: 'offscreen:rpc',
    method,
    args,
  })) as { result?: unknown; error?: string }
  if (response.error) throw { message: response.error }
  return response.result as Awaited<ReturnType<ExtensionRpc[K]>>
}
