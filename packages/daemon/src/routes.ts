import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebSocket } from 'ws'
import { createBirpc, type BirpcReturn } from 'birpc'
import { EXTENSION_WS_PATH, type ExtensionRpc, type RpcResponse } from '@bb/protocol'
import { errorMessage } from '@bb/utils'
import { host, port, requestTimeoutMs } from './config.js'
import { readJson, writeHtml, writeJson } from './utils.js'

let extensionSocket: WebSocket | undefined
let extensionRpc: BirpcReturn<ExtensionRpc> | undefined
let extensionOrigin: string | undefined

export function handleWebSocketConnection(
  ws: WebSocket,
  request: { headers: { origin?: string } },
) {
  extensionSocket?.close(1012, 'Replaced by a newer extension connection')
  extensionRpc?.$close()

  extensionSocket = ws
  extensionOrigin = request.headers.origin
  extensionRpc = createBirpc<ExtensionRpc, Record<string, never>>(
    {},
    {
      post: (data) => ws.send(data),
      on: (fn) => ws.on('message', fn),
      off: (fn) => ws.off('message', fn),
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      timeout: requestTimeoutMs,
    },
  )

  ws.on('close', function () {
    if (extensionSocket === ws) {
      extensionSocket = undefined
      extensionRpc = undefined
      extensionOrigin = undefined
    }
  })
}

export async function routeHttp(
  request: IncomingMessage,
  response: ServerResponse,
  onShutdown?: () => void,
) {
  const url = new URL(request.url ?? '/', `http://localhost`)

  if (request.method === 'POST' && url.pathname === '/shutdown') {
    writeJson(response, 200, { ok: true, message: 'Shutting down' })
    onShutdown?.()
    return
  }

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

  const rpc = extensionRpc
  if (!rpc || !extensionSocket || extensionSocket.readyState !== extensionSocket.OPEN) {
    writeJson(response, 200, { ok: false, error: 'Browser extension is not connected' })
    return
  }

  if (request.method === 'GET' && url.pathname === '/bookmarks/tree') {
    writeJson(response, 200, await tryRpc(() => rpc.getTree()))
    return
  }

  if (request.method === 'GET' && url.pathname === '/bookmarks/search') {
    const query = url.searchParams.get('q') ?? ''
    writeJson(response, 200, await tryRpc(() => rpc.search(query)))
    return
  }

  if (request.method === 'POST' && url.pathname === '/bookmarks') {
    const body = await readJson(request)
    writeJson(response, 200, await tryRpc(() => rpc.create(body)))
    return
  }

  if (request.method === 'GET' && url.pathname === '/bookmarks/unused') {
    const days = Number(url.searchParams.get('days') ?? '90')
    const result = await tryRpc(() => rpc.getTree())
    if (!result.ok) {
      writeJson(response, 200, result)
      return
    }
    writeHtml(response, 200, renderUnusedHtml(result.result as unknown[], days))
    return
  }

  const bookmarkIdMatch = url.pathname.match(/^\/bookmarks\/([^/]+)$/)

  if (request.method === 'GET' && bookmarkIdMatch) {
    const id = decodeURIComponent(bookmarkIdMatch[1])
    writeJson(response, 200, await tryRpc(() => rpc.get(id)))
    return
  }

  if (request.method === 'PATCH' && bookmarkIdMatch) {
    const id = decodeURIComponent(bookmarkIdMatch[1])
    const body = await readJson(request)
    const { id: _ignored, ...changes } = body as { id?: unknown; title?: string; url?: string }
    writeJson(response, 200, await tryRpc(() => rpc.update(id, changes)))
    return
  }

  if (request.method === 'DELETE' && bookmarkIdMatch) {
    const id = decodeURIComponent(bookmarkIdMatch[1])
    writeJson(response, 200, await tryRpc(() => rpc.remove(id)))
    return
  }

  const moveMatch = url.pathname.match(/^\/bookmarks\/([^/]+)\/move$/)
  if (request.method === 'POST' && moveMatch) {
    const id = decodeURIComponent(moveMatch[1])
    const body = await readJson(request)
    const { id: _ignored, ...changes } = body as { id?: unknown; parentId?: string; index?: number }
    writeJson(response, 200, await tryRpc(() => rpc.move(id, changes)))
    return
  }

  const treeMatch = url.pathname.match(/^\/bookmarks\/([^/]+)\/tree$/)
  if (request.method === 'DELETE' && treeMatch) {
    const id = decodeURIComponent(treeMatch[1])
    writeJson(response, 200, await tryRpc(() => rpc.removeTree(id)))
    return
  }

  writeJson(response, 404, { ok: false, error: 'Not found' })
}

async function tryRpc<T>(fn: () => Promise<T>): Promise<RpcResponse> {
  try {
    return { ok: true, result: await fn() }
  } catch (error) {
    return { ok: false, error: errorMessage(error) }
  }
}

function renderUnusedHtml(nodes: unknown[], days: number): string {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000
  const items: Array<{
    title: string
    url: string
    dateLastUsed?: number
    dateAdded: number
    folderPath: string
  }> = []

  function walk(nnodes: unknown[], path: string) {
    for (const n of nnodes) {
      const node = n as Record<string, unknown>
      const title = typeof node.title === 'string' ? node.title : ''
      const nodePath = path ? `${path} / ${title}` : title
      const nodeUrl = typeof node.url === 'string' ? node.url : ''
      if (nodeUrl) {
        items.push({
          title: title || nodeUrl,
          url: nodeUrl,
          dateLastUsed: typeof node.dateLastUsed === 'number' ? node.dateLastUsed : undefined,
          dateAdded: Number(node.dateAdded),
          folderPath: path,
        })
      }
      if (Array.isArray(node.children)) {
        walk(node.children, nodePath)
      }
    }
  }

  walk(nodes, '')

  const unused = items.filter((n) => !n.dateLastUsed || n.dateLastUsed < threshold)
  unused.sort((a, b) => {
    if (!a.dateLastUsed) return 1
    if (!b.dateLastUsed) return -1
    return a.dateLastUsed - b.dateLastUsed
  })

  const rows = unused
    .map((n) => {
      const lastUsed = n.dateLastUsed
        ? new Date(n.dateLastUsed).toISOString().slice(0, 10)
        : 'Never'
      const folder = n.folderPath ? `<td>${escapeHtml(n.folderPath)}</td>` : '<td></td>'
      return `<tr>
        <td>${escapeHtml(n.title)}</td>
        <td><a href="${escapeHtml(n.url)}" target="_blank">${escapeHtml(n.url)}</a></td>
        ${folder}
        <td>${lastUsed}</td>
      </tr>`
    })
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Unused Bookmarks</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 2rem; background: #fff; color: #111; line-height: 1.5; }
  h1 { font-size: 1.25rem; margin-bottom: 1rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #eee; }
  th { font-weight: 600; background: #fafafa; position: sticky; top: 0; }
  a { color: #0066cc; text-decoration: none; }
  a:hover { text-decoration: underline; }
  tr:hover { background: #f5f5f5; }
</style>
</head>
<body>
<h1>${unused.length} bookmarks unused in the last ${days} days</h1>
<table>
  <thead>
    <tr>
      <th>Title</th>
      <th>URL</th>
      <th>Folder</th>
      <th>Last Used</th>
    </tr>
  </thead>
  <tbody>
    ${rows || '<tr><td colspan="4" style="text-align:center;color:#999;">No unused bookmarks found</td></tr>'}
  </tbody>
</table>
</body>
</html>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function getExtensionState() {
  return {
    connected: extensionSocket !== undefined && extensionSocket.readyState === extensionSocket.OPEN,
    origin: extensionOrigin,
  }
}

export function isWebSocketPath(url: string): boolean {
  return new URL(url, `http://${host}:${port}`).pathname === EXTENSION_WS_PATH
}
