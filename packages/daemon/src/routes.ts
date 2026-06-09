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

  if (request.method === 'GET' && url.pathname.startsWith('/bookmarks/')) {
    const id = decodeURIComponent(url.pathname.split('/').at(-1) ?? '')
    writeJson(response, 200, await sendToExtension({ method: 'bookmarks.get', params: { id } }))
    return
  }

  if (request.method === 'POST' && url.pathname === '/rpc') {
    const body = await readJson(request)
    writeJson(response, 200, await sendToExtension(body))
    return
  }

  writeJson(response, 404, { ok: false, error: 'Not found' })
}
