import type { IncomingMessage, ServerResponse } from 'node:http'
import { getExtensionState, sendToExtension } from './extension.js'
import { readJson, writeJson } from './utils.js'

export async function routeHttp(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url ?? '/', `http://localhost`)

  if (request.method === 'GET' && url.pathname === '/health') {
    const { connected, origin } = getExtensionState()
    writeJson(response, 200, {
      ok: true,
      daemon: 'ready',
      extensionConnected: connected,
      extensionOrigin: origin,
    })
    return
  }

  if (request.method === 'GET' && url.pathname === '/bookmarks/tree') {
    writeJson(response, 200, await sendToExtension({ method: 'bookmarks.tree' }))
    return
  }

  if (request.method === 'GET' && url.pathname === '/bookmarks/search') {
    const query = url.searchParams.get('q') ?? ''
    writeJson(
      response,
      200,
      await sendToExtension({ method: 'bookmarks.search', params: { query } }),
    )
    return
  }

  if (request.method === 'POST' && url.pathname === '/bookmarks') {
    const body = await readJson(request)
    writeJson(response, 200, await sendToExtension({ method: 'bookmarks.create', params: body }))
    return
  }

  const bookmarkIdMatch = url.pathname.match(/^\/bookmarks\/([^/]+)$/)

  if (request.method === 'GET' && bookmarkIdMatch) {
    const id = decodeURIComponent(bookmarkIdMatch[1])
    writeJson(response, 200, await sendToExtension({ method: 'bookmarks.get', params: { id } }))
    return
  }

  if (request.method === 'PATCH' && bookmarkIdMatch) {
    const id = decodeURIComponent(bookmarkIdMatch[1])
    const body = await readJson(request)
    const { id: _ignored, ...changes } = body as { id?: unknown; title?: string; url?: string }
    writeJson(
      response,
      200,
      await sendToExtension({ method: 'bookmarks.update', params: { id, ...changes } }),
    )
    return
  }

  if (request.method === 'DELETE' && bookmarkIdMatch) {
    const id = decodeURIComponent(bookmarkIdMatch[1])
    writeJson(response, 200, await sendToExtension({ method: 'bookmarks.remove', params: { id } }))
    return
  }

  const moveMatch = url.pathname.match(/^\/bookmarks\/([^/]+)\/move$/)
  if (request.method === 'POST' && moveMatch) {
    const id = decodeURIComponent(moveMatch[1])
    const body = await readJson(request)
    const { id: _ignored, ...changes } = body as { id?: unknown; parentId?: string; index?: number }
    writeJson(
      response,
      200,
      await sendToExtension({ method: 'bookmarks.move', params: { id, ...changes } }),
    )
    return
  }

  const treeMatch = url.pathname.match(/^\/bookmarks\/([^/]+)\/tree$/)
  if (request.method === 'DELETE' && treeMatch) {
    const id = decodeURIComponent(treeMatch[1])
    writeJson(
      response,
      200,
      await sendToExtension({ method: 'bookmarks.removeTree', params: { id } }),
    )
    return
  }

  if (request.method === 'POST' && url.pathname === '/rpc') {
    const body = await readJson(request)
    writeJson(response, 200, await sendToExtension(body))
    return
  }

  writeJson(response, 404, { ok: false, error: 'Not found' })
}
