import {
  collectUnusedBookmarkItems,
  DEFAULT_DAEMON_HOST,
  DEFAULT_DAEMON_PORT,
  errorMessage,
  EXTENSION_WS_PATH,
  type ExtensionRpc,
  type MoveByPathItem,
  type tabGroups,
} from '@bb/shared'
import { createBirpc, type BirpcReturn } from 'birpc'
import type { H3Event } from 'h3'
import {
  createError,
  createRouter,
  defineEventHandler,
  getQuery,
  getRouterParams,
  readBody,
  setResponseHeader,
} from 'h3'
import type { WebSocket } from 'ws'

const host = process.env.BB_DAEMON_HOST ?? DEFAULT_DAEMON_HOST
const port = Number(process.env.BB_DAEMON_PORT ?? DEFAULT_DAEMON_PORT)
const requestTimeoutMs = Number(process.env.BB_EXTENSION_TIMEOUT_MS ?? 10_000)

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

export function createAppRouter(onShutdown?: () => void) {
  const router = createRouter()

  router.post(
    '/shutdown',
    defineEventHandler(() => {
      onShutdown?.()
      return { message: 'Shutting down' }
    }),
  )

  router.get(
    '/health',
    defineEventHandler(() => {
      const { connected, origin } = getExtensionState()
      return {
        daemon: 'ready',
        extensionConnected: connected,
        extensionOrigin: origin,
      }
    }),
  )

  router.get(
    '/tabs',
    defineEventHandler(async (event) => {
      const query = getQuery(event)
      const active = query.active === 'true' ? true : query.active === 'false' ? false : undefined
      const currentWindow =
        query.currentWindow === 'true' ? true : query.currentWindow === 'false' ? false : undefined
      const windowId = query.windowId ? Number(query.windowId) : undefined
      return requireRpc().getTabs({ active, currentWindow, windowId })
    }),
  )

  router.post(
    '/tabs',
    defineEventHandler(async (event) => {
      const body = await readBody(event)
      return requireRpc().createTab(body as { url?: string; active?: boolean; pinned?: boolean })
    }),
  )

  router.post(
    '/tabs/:id/reload',
    defineEventHandler(async (event) => {
      const query = getQuery(event)
      await requireRpc().reloadTab(decodeTabId(event), query.bypassCache === 'true')
      return { ok: true }
    }),
  )

  router.delete(
    '/tabs/:id',
    defineEventHandler(async (event) => {
      await requireRpc().closeTab(decodeTabId(event))
      return { ok: true }
    }),
  )

  router.post(
    '/tabs/:id/activate',
    defineEventHandler(async (event) => {
      return requireRpc().activateTab(decodeTabId(event))
    }),
  )

  router.patch(
    '/tabs/:id',
    defineEventHandler(async (event) => {
      const body = await readBody(event)
      const { id: _ignored, ...changes } = body as {
        id?: unknown
        url?: string
        active?: boolean
        pinned?: boolean
      }
      return requireRpc().updateTab(decodeTabId(event), changes)
    }),
  )

  router.post(
    '/tabs/:id/duplicate',
    defineEventHandler(async (event) => {
      return requireRpc().duplicateTab(decodeTabId(event))
    }),
  )

  router.post(
    '/tabs/:id/move',
    defineEventHandler(async (event) => {
      const body = await readBody(event)
      const { id: _ignored, ...moveProperties } = body as {
        id?: unknown
        index: number
        windowId?: number
      }
      return requireRpc().moveTab(decodeTabId(event), moveProperties)
    }),
  )

  router.get(
    '/tabs/groups',
    defineEventHandler(async (event) => {
      const query = getQuery(event)
      const collapsed =
        query.collapsed === 'true' ? true : query.collapsed === 'false' ? false : undefined
      const windowId = query.windowId ? Number(query.windowId) : undefined
      const title = typeof query.title === 'string' ? query.title : undefined
      const color =
        typeof query.color === 'string' ? (query.color as `${tabGroups.Color}`) : undefined
      return requireRpc().getTabGroups({ collapsed, windowId, title, color })
    }),
  )

  router.post(
    '/tabs/group',
    defineEventHandler(async (event) => {
      const body = (await readBody(event)) as {
        tabIds: number[]
        groupId?: number
      }
      if (!Array.isArray(body.tabIds) || body.tabIds.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'tabIds array is required' })
      }
      return requireRpc().groupTabs(body.tabIds, body.groupId)
    }),
  )

  router.post(
    '/tabs/ungroup',
    defineEventHandler(async (event) => {
      const body = (await readBody(event)) as { tabIds: number[] }
      if (!Array.isArray(body.tabIds) || body.tabIds.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'tabIds array is required' })
      }
      await requireRpc().ungroupTabs(body.tabIds)
      return { ok: true }
    }),
  )

  router.patch(
    '/tabs/groups/:id',
    defineEventHandler(async (event) => {
      const body = await readBody(event)
      const { id: _ignored, ...rawChanges } = body as {
        id?: unknown
        collapsed?: boolean
        title?: string
        color?: string
      }
      const changes: tabGroups.UpdateProperties = {
        ...rawChanges,
        color: rawChanges.color as `${tabGroups.Color}` | undefined,
      }
      return requireRpc().updateTabGroup(decodeTabId(event), changes)
    }),
  )

  router.post(
    '/tabs/groups/:id/move',
    defineEventHandler(async (event) => {
      const body = await readBody(event)
      const { id: _ignored, ...moveProperties } = body as {
        id?: unknown
        index: number
        windowId?: number
      }
      return requireRpc().moveTabGroup(decodeTabId(event), moveProperties)
    }),
  )

  router.delete(
    '/tabs/groups/:id',
    defineEventHandler(async (event) => {
      await requireRpc().removeTabGroup(decodeTabId(event))
      return { ok: true }
    }),
  )

  router.get(
    '/bookmarks/tree',
    defineEventHandler(async () => {
      return requireRpc().getTree()
    }),
  )

  router.get(
    '/bookmarks/folders',
    defineEventHandler(async () => {
      return requireRpc().getFolders()
    }),
  )

  router.get(
    '/bookmarks/search',
    defineEventHandler(async (event) => {
      const rawQuery = getQuery(event).q
      const query = Array.isArray(rawQuery) ? rawQuery[0] : (rawQuery ?? '')
      return requireRpc().search(query)
    }),
  )

  router.post(
    '/bookmarks',
    defineEventHandler(async (event) => {
      return requireRpc().create(await readBody(event))
    }),
  )

  router.get(
    '/bookmarks/unused',
    defineEventHandler(async (event) => {
      const days = Number(getQuery(event).days ?? '90')
      const tree = await requireRpc().getTree()
      setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
      return renderUnusedHtml(tree as unknown[], days)
    }),
  )

  router.get(
    '/bookmarks/:id',
    defineEventHandler(async (event) => {
      return requireRpc().get(decodeId(event))
    }),
  )

  router.get(
    '/bookmarks/:id/children',
    defineEventHandler(async (event) => {
      return requireRpc().getChildren(decodeId(event))
    }),
  )

  router.patch(
    '/bookmarks/:id',
    defineEventHandler(async (event) => {
      const body = await readBody(event)
      const { id: _ignored, ...changes } = body as { id?: unknown; title?: string; url?: string }
      return requireRpc().update(decodeId(event), changes)
    }),
  )

  router.post(
    '/bookmarks/:id/move',
    defineEventHandler(async (event) => {
      const body = await readBody(event)
      const { id: _ignored, ...changes } = body as {
        id?: unknown
        parentId?: string
        index?: number
      }
      return requireRpc().move(decodeId(event), changes)
    }),
  )

  router.post(
    '/bookmarks/move-by-path',
    defineEventHandler(async (event) => {
      const body = (await readBody(event)) as MoveByPathItem | MoveByPathItem[]
      if (Array.isArray(body)) {
        for (const [i, item] of body.entries()) {
          if (!item || typeof item !== 'object' || !item.id || !item.path) {
            throw createError({
              statusCode: 400,
              statusMessage: `item at index ${i} is missing id or path`,
            })
          }
        }
        try {
          return await requireRpc().moveByPathBatch(body)
        } catch (error) {
          console.error('move-by-path error:', error)
          throw createError({
            statusCode: 500,
            statusMessage: errorMessage(error),
          })
        }
      }
      if (!body.id || !body.path) {
        throw createError({
          statusCode: 400,
          statusMessage: 'id and path are required',
        })
      }
      try {
        return await requireRpc().moveByPath(body.id, body.path, body.index)
      } catch (error) {
        console.error('move-by-path error:', error)
        throw createError({
          statusCode: 500,
          statusMessage: errorMessage(error),
        })
      }
    }),
  )

  router.post(
    '/bookmarks/remove-by-path',
    defineEventHandler(async (event) => {
      const body = (await readBody(event)) as { path: string }
      if (!body.path) {
        throw createError({ statusCode: 400, statusMessage: 'path is required' })
      }
      await requireRpc().removeByPath(body.path)
      return { ok: true }
    }),
  )

  router.delete(
    '/bookmarks/:id/tree',
    defineEventHandler(async (event) => {
      await requireRpc().removeTree(decodeId(event))
      return { ok: true }
    }),
  )

  router.delete(
    '/bookmarks/:id',
    defineEventHandler(async (event) => {
      await requireRpc().remove(decodeId(event))
      return { ok: true }
    }),
  )

  return router
}

function requireRpc() {
  const rpc = extensionRpc
  if (!rpc || !extensionSocket || extensionSocket.readyState !== extensionSocket.OPEN) {
    throw createError({ statusCode: 503, statusMessage: 'Browser extension is not connected' })
  }
  return rpc
}

function decodeId(event: H3Event): string {
  return decodeURIComponent(getRouterParams(event).id as string)
}

function decodeTabId(event: H3Event): number {
  return Number(getRouterParams(event).id)
}

function renderUnusedHtml(nodes: unknown[], days: number): string {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000
  const allItems = collectUnusedBookmarkItems(nodes)
  const unused = allItems.filter((n) => !n.dateLastUsed || n.dateLastUsed < threshold)
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
