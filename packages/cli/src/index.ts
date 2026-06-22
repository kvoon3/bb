#!/usr/bin/env node
import { readFile } from 'node:fs/promises'

import { startDaemon } from '@bb/daemon'
import {
  DEFAULT_DAEMON_HOST,
  DEFAULT_DAEMON_PORT,
  errorMessage,
  findNodeByPath,
  type bookmarks,
} from '@bb/shared'
import { cac } from 'cac'

import packageJson from '../package.json' with { type: 'json' }
import { matchRule, normalizeRules } from './rules.js'
import { daemonBaseUrl } from './url.js'

const cli = cac('bb')

type GlobalOptions = {
  host?: string
  port?: string | number
  json?: boolean
}

function isTruthy(value: string | boolean | undefined): boolean | undefined {
  if (value === undefined) return undefined
  if (value === true) return true
  if (value === false) return false
  return value === 'true'
}

cli
  .option('--host <host>', 'Daemon host', { default: DEFAULT_DAEMON_HOST })
  .option('--port <port>', 'Daemon port', { default: String(DEFAULT_DAEMON_PORT) })
  .option('--json', 'Print raw JSON responses')

cli
  .command('health', 'Check daemon and extension status')
  .action(async (options: GlobalOptions) => {
    console.log(JSON.stringify(await request(options, '/health'), null, 2))
  })

cli
  .command('tabs', 'List open browser tabs')
  .option('--active [active]', 'Filter by active state (true/false)')
  .option('--current-window [currentWindow]', 'Filter by current window (true/false)')
  .option('--window-id <windowId>', 'Filter by window id')
  .action(
    async (
      options: GlobalOptions & {
        active?: string | boolean
        currentWindow?: string | boolean
        windowId?: string
      },
    ) => {
      const params = new URLSearchParams()
      if (options.active !== undefined) params.set('active', String(options.active))
      if (options.currentWindow !== undefined)
        params.set('currentWindow', String(options.currentWindow))
      if (options.windowId !== undefined) params.set('windowId', options.windowId)
      const query = params.toString()
      console.log(
        JSON.stringify(await request(options, `/tabs${query ? `?${query}` : ''}`), null, 2),
      )
    },
  )

cli
  .command('tabs:create <url>', 'Open a new browser tab')
  .option('--active [active]', 'Make the tab active', { default: 'true' })
  .option('--pinned [pinned]', 'Pin the tab', { default: 'false' })
  .option('--window-id <windowId>', 'Window id')
  .option('--index <index>', 'Position index')
  .action(
    async (
      url: string,
      options: GlobalOptions & {
        active?: string | boolean
        pinned?: string | boolean
        windowId?: string
        index?: string
      },
    ) => {
      const body: {
        url: string
        active?: boolean
        pinned?: boolean
        windowId?: number
        index?: number
      } = {
        url,
      }
      if (options.active !== undefined) body.active = isTruthy(options.active)
      if (options.pinned !== undefined) body.pinned = isTruthy(options.pinned)
      if (options.windowId !== undefined) body.windowId = Number(options.windowId)
      if (options.index !== undefined) body.index = Number(options.index)
      console.log(
        JSON.stringify(
          await request(options, '/tabs', {
            body: JSON.stringify(body),
            headers: { 'content-type': 'application/json' },
            method: 'POST',
          }),
          null,
          2,
        ),
      )
    },
  )

cli
  .command('tabs:reload [id]', 'Reload a browser tab')
  .option('--bypass-cache', 'Bypass the local cache')
  .action(async (id: string | undefined, options: GlobalOptions & { bypassCache?: boolean }) => {
    if (id === undefined) {
      throw new Error('Tab id is required')
    }
    const params = new URLSearchParams()
    if (options.bypassCache) params.set('bypassCache', 'true')
    const query = params.toString()
    console.log(
      JSON.stringify(
        await request(options, `/tabs/${id}/reload${query ? `?${query}` : ''}`, { method: 'POST' }),
        null,
        2,
      ),
    )
  })

cli
  .command('tabs:close [id]', 'Close a browser tab')
  .action(async (id: string | undefined, options: GlobalOptions) => {
    if (id === undefined) {
      throw new Error('Tab id is required')
    }
    console.log(
      JSON.stringify(await request(options, `/tabs/${id}`, { method: 'DELETE' }), null, 2),
    )
  })

cli
  .command('tabs:activate <id>', 'Activate a browser tab')
  .action(async (id: string, options: GlobalOptions) => {
    console.log(
      JSON.stringify(await request(options, `/tabs/${id}/activate`, { method: 'POST' }), null, 2),
    )
  })

cli
  .command('tabs:update <id>', 'Update a browser tab')
  .option('--url <url>', 'New URL')
  .option('--pinned [pinned]', 'Pin or unpin the tab')
  .action(
    async (id: string, options: GlobalOptions & { url?: string; pinned?: string | boolean }) => {
      const body: { url?: string; pinned?: boolean } = {}
      if (options.url !== undefined) body.url = options.url
      if (options.pinned !== undefined) body.pinned = isTruthy(options.pinned)
      console.log(
        JSON.stringify(
          await request(options, `/tabs/${id}`, {
            body: JSON.stringify(body),
            headers: { 'content-type': 'application/json' },
            method: 'PATCH',
          }),
          null,
          2,
        ),
      )
    },
  )

cli
  .command('tabs:duplicate <id>', 'Duplicate a browser tab')
  .action(async (id: string, options: GlobalOptions) => {
    console.log(
      JSON.stringify(await request(options, `/tabs/${id}/duplicate`, { method: 'POST' }), null, 2),
    )
  })

cli
  .command('tabs:move <id>', 'Move a browser tab')
  .option('--index <index>', 'New position index', { default: '0' })
  .option('--window-id <windowId>', 'Target window id')
  .action(async (id: string, options: GlobalOptions & { index?: string; windowId?: string }) => {
    const body: { index: number; windowId?: number } = {
      index: Number(options.index ?? '0'),
    }
    if (options.windowId !== undefined) body.windowId = Number(options.windowId)
    console.log(
      JSON.stringify(
        await request(options, `/tabs/${id}/move`, {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        }),
        null,
        2,
      ),
    )
  })

cli
  .command('tabs:groups', 'List tab groups')
  .option('--collapsed [collapsed]', 'Filter by collapsed state (true/false)')
  .option('--window-id <windowId>', 'Filter by window id')
  .option('--title <title>', 'Filter by title')
  .option('--color <color>', 'Filter by color')
  .action(
    async (
      options: GlobalOptions & {
        collapsed?: string | boolean
        windowId?: string
        title?: string
        color?: string
      },
    ) => {
      const params = new URLSearchParams()
      if (options.collapsed !== undefined) params.set('collapsed', String(options.collapsed))
      if (options.windowId !== undefined) params.set('windowId', options.windowId)
      if (options.title !== undefined) params.set('title', options.title)
      if (options.color !== undefined) params.set('color', options.color)
      const query = params.toString()
      console.log(
        JSON.stringify(await request(options, `/tabs/groups${query ? `?${query}` : ''}`), null, 2),
      )
    },
  )

cli
  .command('tabs:group', 'Group one or more tabs')
  .option('--tab-ids <tabIds>', 'Comma-separated tab ids to group', { default: '' })
  .option('--group-id <groupId>', 'Add tabs to an existing group')
  .option('--title <title>', 'Group title')
  .option(
    '--color <color>',
    'Group color (grey, blue, red, yellow, green, pink, purple, cyan, orange)',
  )
  .option('--collapsed [collapsed]', 'Collapse the group (true/false)')
  .action(
    async (
      options: GlobalOptions & {
        tabIds?: string
        groupId?: string
        title?: string
        color?: string
        collapsed?: string | boolean
      },
    ) => {
      const tabIds = String(options.tabIds ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
        .map(Number)
      if (tabIds.length === 0) {
        throw new Error('At least one tab id is required (--tab-ids)')
      }

      const existingGroupId = options.groupId !== undefined ? Number(options.groupId) : undefined
      const newGroupId = (await request(options, '/tabs/group', {
        body: JSON.stringify({ tabIds, groupId: existingGroupId }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })) as number

      const changes: { title?: string; color?: string; collapsed?: boolean } = {}
      if (options.title !== undefined) changes.title = options.title
      if (options.color !== undefined) changes.color = options.color
      if (options.collapsed !== undefined) changes.collapsed = isTruthy(options.collapsed)

      if (Object.keys(changes).length > 0) {
        console.log(
          JSON.stringify(
            await request(options, `/tabs/groups/${newGroupId}`, {
              body: JSON.stringify(changes),
              headers: { 'content-type': 'application/json' },
              method: 'PATCH',
            }),
            null,
            2,
          ),
        )
        return
      }

      console.log(JSON.stringify({ groupId: newGroupId }, null, 2))
    },
  )

cli
  .command('tabs:ungroup', 'Ungroup one or more tabs')
  .option('--tab-ids <tabIds>', 'Comma-separated tab ids to ungroup', { default: '' })
  .action(async (options: GlobalOptions & { tabIds?: string }) => {
    const tabIds = String(options.tabIds ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .map(Number)
    if (tabIds.length === 0) {
      throw new Error('At least one tab id is required (--tab-ids)')
    }
    console.log(
      JSON.stringify(
        await request(options, '/tabs/ungroup', {
          body: JSON.stringify({ tabIds }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        }),
        null,
        2,
      ),
    )
  })

cli
  .command('tabs:groups:update <groupId>', 'Update a tab group')
  .option('--title <title>', 'Group title')
  .option(
    '--color <color>',
    'Group color (grey, blue, red, yellow, green, pink, purple, cyan, orange)',
  )
  .option('--collapsed [collapsed]', 'Collapse the group (true/false)')
  .action(
    async (
      groupId: string,
      options: GlobalOptions & {
        title?: string
        color?: string
        collapsed?: string | boolean
      },
    ) => {
      const body: { title?: string; color?: string; collapsed?: boolean } = {}
      if (options.title !== undefined) body.title = options.title
      if (options.color !== undefined) body.color = options.color
      if (options.collapsed !== undefined) body.collapsed = isTruthy(options.collapsed)
      console.log(
        JSON.stringify(
          await request(options, `/tabs/groups/${groupId}`, {
            body: JSON.stringify(body),
            headers: { 'content-type': 'application/json' },
            method: 'PATCH',
          }),
          null,
          2,
        ),
      )
    },
  )

cli
  .command('tabs:groups:move <groupId>', 'Move a tab group')
  .option('--index <index>', 'New position index', { default: '0' })
  .option('--window-id <windowId>', 'Target window id')
  .action(
    async (groupId: string, options: GlobalOptions & { index?: string; windowId?: string }) => {
      const body: { index: number; windowId?: number } = {
        index: Number(options.index ?? '0'),
      }
      if (options.windowId !== undefined) body.windowId = Number(options.windowId)
      console.log(
        JSON.stringify(
          await request(options, `/tabs/groups/${groupId}/move`, {
            body: JSON.stringify(body),
            headers: { 'content-type': 'application/json' },
            method: 'POST',
          }),
          null,
          2,
        ),
      )
    },
  )

cli
  .command('tabs:groups:remove <groupId>', 'Ungroup all tabs in a tab group')
  .action(async (groupId: string, options: GlobalOptions) => {
    console.log(
      JSON.stringify(
        await request(options, `/tabs/groups/${groupId}`, { method: 'DELETE' }),
        null,
        2,
      ),
    )
  })

cli
  .command('bookmarks:tree', 'Read the complete browser bookmark tree')
  .action(async (options: GlobalOptions) => {
    console.log(JSON.stringify(await request(options, '/bookmarks/tree'), null, 2))
  })

cli
  .command('bookmarks:folders', 'List all bookmark folders')
  .action(async (options: GlobalOptions) => {
    console.log(JSON.stringify(await request(options, '/bookmarks/folders'), null, 2))
  })

cli
  .command('bookmarks:search <query>', 'Search browser bookmarks')
  .action(async (query: string, options: GlobalOptions) => {
    console.log(
      JSON.stringify(
        await request(options, `/bookmarks/search?q=${encodeURIComponent(query)}`),
        null,
        2,
      ),
    )
  })

cli
  .command('bookmarks:get <id>', 'Read one browser bookmark node by id')
  .action(async (id: string, options: GlobalOptions) => {
    console.log(
      JSON.stringify(await request(options, `/bookmarks/${encodeURIComponent(id)}`), null, 2),
    )
  })

cli
  .command('bookmarks:children <id>', 'List children of a bookmark folder')
  .action(async (id: string, options: GlobalOptions) => {
    console.log(
      JSON.stringify(
        await request(options, `/bookmarks/${encodeURIComponent(id)}/children`),
        null,
        2,
      ),
    )
  })

cli
  .command('bookmarks:create', 'Create one or more bookmarks or folders')
  .option('--title <title>', 'Bookmark title')
  .option('--url <url>', 'Bookmark URL')
  .option('--parent-id <parentId>', 'Parent folder id')
  .option('--path <path>', 'Target folder path (e.g. Websites/Personal). Creates missing folders.')
  .option('--index <index>', 'Position index within the parent folder')
  .option(
    '--file <path>',
    'JSON file with an array of bookmarks to create (use --file=- for stdin)',
  )
  .example(
    '  # Create a single bookmark\n  $ bb bookmarks:create --title "Vite" --url https://vitejs.dev',
  )
  .example(
    '  # Create a bookmark under a path, creating folders if needed\n  $ bb bookmarks:create --title "Vite" --url https://vitejs.dev --path Websites/Personal',
  )
  .example(
    '  # Create many bookmarks from a JSON file\n  $ bb bookmarks:create --file bookmarks.json',
  )
  .example(
    '  # Batch create with a default path for items without parentId\n  $ bb bookmarks:create --file bookmarks.json --path Websites/Personal',
  )
  .action(
    async (
      options: GlobalOptions & {
        title?: string
        url?: string
        parentId?: string
        path?: string
        index?: string
        file?: string
      },
    ) => {
      if (options.parentId !== undefined && options.path !== undefined) {
        throw new Error('Cannot use both --parent-id and --path')
      }

      const items: Array<{ title?: string; url?: string; parentId?: string; index?: number }> =
        options.file
          ? await readBatchFile(options.file)
          : [
              {
                title: options.title,
                url: options.url,
                parentId: options.parentId === undefined ? undefined : String(options.parentId),
                index: options.index === undefined ? undefined : Number(options.index),
              },
            ]

      if (items.length === 0) {
        throw new Error('No bookmarks provided')
      }

      async function createOne(item: {
        title?: string
        url?: string
        parentId?: string
        index?: number
      }) {
        const created = (await request(options, '/bookmarks', {
          body: JSON.stringify(item),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        })) as { id: string }

        if (options.path && item.parentId === undefined) {
          return request(options, '/bookmarks/move-by-path', {
            body: JSON.stringify({
              id: created.id,
              path: options.path,
              index: item.index,
            }),
            headers: { 'content-type': 'application/json' },
            method: 'POST',
          })
        }

        return created
      }

      if (options.file) {
        const results = await Promise.allSettled(items.map((item) => createOne(item)))
        console.log(JSON.stringify(results, null, 2))
      } else {
        console.log(JSON.stringify(await createOne(items[0]), null, 2))
      }
    },
  )

cli
  .command('bookmarks:update [id]', 'Update one or more bookmark titles or URLs')
  .option('--title <title>', 'New bookmark title')
  .option('--url <url>', 'New bookmark URL')
  .option(
    '--file <path>',
    'JSON file with an array of { id, title?, url? } (use --file=- for stdin)',
  )
  .example('  # Update a bookmark title\n  $ bb bookmarks:update 123 --title "New title"')
  .example('  # Batch update from a JSON file\n  $ bb bookmarks:update --file updates.json')
  .action(
    async (
      id: string | undefined,
      options: GlobalOptions & { title?: string; url?: string; file?: string },
    ) => {
      const items: Array<{ id: string; title?: string; url?: string }> = options.file
        ? await readBatchFile(options.file)
        : [{ id: id!, title: options.title, url: options.url }]

      if (items.length === 0) {
        throw new Error('No bookmarks provided')
      }

      if (options.file) {
        const results = await Promise.allSettled(
          items.map((item) =>
            request(options, `/bookmarks/${encodeURIComponent(item.id)}`, {
              body: JSON.stringify({ title: item.title, url: item.url }),
              headers: { 'content-type': 'application/json' },
              method: 'PATCH',
            }),
          ),
        )
        console.log(JSON.stringify(results, null, 2))
      } else {
        console.log(
          JSON.stringify(
            await request(options, `/bookmarks/${encodeURIComponent(items[0].id)}`, {
              body: JSON.stringify({ title: items[0].title, url: items[0].url }),
              headers: { 'content-type': 'application/json' },
              method: 'PATCH',
            }),
            null,
            2,
          ),
        )
      }
    },
  )

cli
  .command('bookmarks:move [id]', 'Move one or more bookmarks to another folder or position')
  .option('--parent-id <parentId>', 'New parent folder id')
  .option('--path <path>', 'Target folder path (e.g. Websites/Personal). Creates missing folders.')
  .option('--index <index>', 'New position index')
  .option(
    '--file <path>',
    'JSON file with an array of { id, parentId?, index? } (use --file=- for stdin)',
  )
  .example('  # Move to an existing folder by id\n  $ bb bookmarks:move 123 --parent-id 456')
  .example(
    '  # Move to a path, creating folders if needed\n  $ bb bookmarks:move 123 --path Websites/Personal',
  )
  .example('  # Batch move from a JSON file\n  $ bb bookmarks:move --file moves.json')
  .example(
    '  # Batch move to a default path (items without parentId use --path)\n  $ bb bookmarks:move --file moves.json --path Archive',
  )
  .action(
    async (
      id: string | undefined,
      options: GlobalOptions & {
        parentId?: string
        path?: string
        index?: string
        file?: string
      },
    ) => {
      if (options.parentId !== undefined && options.path !== undefined) {
        throw new Error('Cannot use both --parent-id and --path')
      }

      if (options.parentId !== undefined && options.path !== undefined) {
        throw new Error('Cannot use both --parent-id and --path')
      }

      const items: Array<{ id: string; parentId?: string; index?: number }> = options.file
        ? await readBatchFile(options.file)
        : [
            {
              id: id!,
              parentId: options.parentId === undefined ? undefined : String(options.parentId),
              index: options.index === undefined ? undefined : Number(options.index),
            },
          ]

      if (items.length === 0) {
        throw new Error('No bookmarks provided')
      }

      if (options.file) {
        for (const [i, item] of items.entries()) {
          if (item.parentId === undefined && options.path === undefined) {
            throw new Error(
              `Batch move item at index ${i} must specify parentId or use --path as a fallback`,
            )
          }
        }

        const results = await Promise.allSettled(
          items.map(async (item) => {
            if (item.parentId === undefined) {
              return request(options, '/bookmarks/move-by-path', {
                body: JSON.stringify({
                  id: item.id,
                  path: options.path,
                  index: item.index,
                }),
                headers: { 'content-type': 'application/json' },
                method: 'POST',
              })
            }
            return request(options, `/bookmarks/${encodeURIComponent(item.id)}/move`, {
              body: JSON.stringify({ parentId: item.parentId, index: item.index }),
              headers: { 'content-type': 'application/json' },
              method: 'POST',
            })
          }),
        )
        console.log(JSON.stringify(results, null, 2))
      } else if (options.path) {
        console.log(
          JSON.stringify(
            await request(options, '/bookmarks/move-by-path', {
              body: JSON.stringify({
                id: items[0].id,
                path: options.path,
                index: items[0].index,
              }),
              headers: { 'content-type': 'application/json' },
              method: 'POST',
            }),
            null,
            2,
          ),
        )
      } else {
        console.log(
          JSON.stringify(
            await request(options, `/bookmarks/${encodeURIComponent(items[0].id)}/move`, {
              body: JSON.stringify({ parentId: items[0].parentId, index: items[0].index }),
              headers: { 'content-type': 'application/json' },
              method: 'POST',
            }),
            null,
            2,
          ),
        )
      }
    },
  )

cli
  .command('bookmarks:remove [id]', 'Remove one or more bookmarks or empty folders')
  .option('--file <path>', 'JSON file with an array of bookmark ids (use --file=- for stdin)')
  .example('  # Remove a single bookmark\n  $ bb bookmarks:remove 123')
  .example('  # Remove many bookmarks from a JSON file\n  $ bb bookmarks:remove --file ids.json')
  .action(async (id: string | undefined, options: GlobalOptions & { file?: string }) => {
    const ids: string[] = options.file ? await readBatchFile(options.file) : [id!]

    if (ids.length === 0) {
      throw new Error('No bookmark ids provided')
    }

    if (options.file) {
      const results = await Promise.allSettled(
        ids.map((item) =>
          request(options, `/bookmarks/${encodeURIComponent(item)}`, { method: 'DELETE' }),
        ),
      )
      console.log(JSON.stringify(results, null, 2))
    } else {
      console.log(
        JSON.stringify(
          await request(options, `/bookmarks/${encodeURIComponent(ids[0])}`, { method: 'DELETE' }),
          null,
          2,
        ),
      )
    }
  })

cli
  .command('bookmarks:remove-tree [id]', 'Recursively remove a bookmark folder tree')
  .option('--path <path>', 'Folder path to remove (e.g. Archive/Old)')
  .example('  # Remove a folder tree by id\n  $ bb bookmarks:remove-tree 123')
  .example('  # Remove a folder tree by path\n  $ bb bookmarks:remove-tree --path Archive/Old')
  .action(async (id: string | undefined, options: GlobalOptions & { path?: string }) => {
    if (id !== undefined && options.path !== undefined) {
      throw new Error('Cannot use both [id] and --path')
    }
    if (id === undefined && options.path === undefined) {
      throw new Error('Either [id] or --path is required')
    }

    if (options.path !== undefined) {
      console.log(
        JSON.stringify(
          await request(options, '/bookmarks/remove-by-path', {
            body: JSON.stringify({ path: options.path }),
            headers: { 'content-type': 'application/json' },
            method: 'POST',
          }),
          null,
          2,
        ),
      )
      return
    }

    console.log(
      JSON.stringify(
        await request(options, `/bookmarks/${encodeURIComponent(id!)}/tree`, { method: 'DELETE' }),
        null,
        2,
      ),
    )
  })

cli
  .command('bookmarks:unused', 'List bookmarks not visited recently')
  .option('--days <days>', 'Number of days threshold', { default: '90' })
  .action(async (options: GlobalOptions & { days?: string }) => {
    const days = Number(options.days ?? '90')
    const threshold = Date.now() - days * 24 * 60 * 60 * 1000

    const tree = await request(options, '/bookmarks/tree')

    const items: Array<{
      title: string
      url: string
      id: string
      dateLastUsed?: number
      dateAdded: number
      folderPath: string
    }> = []

    function walk(nodes: Array<Record<string, unknown>>, path: string) {
      for (const n of nodes) {
        const title = typeof n.title === 'string' ? n.title : ''
        const nodePath = path ? `${path} / ${title}` : title
        const url = typeof n.url === 'string' ? n.url : ''
        if (url) {
          items.push({
            title: title || url,
            url,
            id: String(n.id),
            dateLastUsed: typeof n.dateLastUsed === 'number' ? n.dateLastUsed : undefined,
            dateAdded: Number(n.dateAdded),
            folderPath: path,
          })
        }
        if (Array.isArray(n.children)) {
          walk(n.children as Array<Record<string, unknown>>, nodePath)
        }
      }
    }

    walk(tree as Array<Record<string, unknown>>, '')

    const unused = items.filter((n) => !n.dateLastUsed || n.dateLastUsed < threshold)
    unused.sort((a, b) => {
      if (!a.dateLastUsed) return 1
      if (!b.dateLastUsed) return -1
      return a.dateLastUsed - b.dateLastUsed
    })

    if (options.json) {
      console.log(JSON.stringify({ count: unused.length, items: unused }, null, 2))
      return
    }

    console.log(`Found ${unused.length} bookmarks unused in the last ${days} days\n`)
    for (const n of unused) {
      const lastUsed = n.dateLastUsed
        ? new Date(n.dateLastUsed).toISOString().slice(0, 10)
        : 'Never'
      console.log(`[${lastUsed}] ${n.title}`)
      console.log(`  ${n.url}`)
      if (n.folderPath) {
        console.log(`  in: ${n.folderPath}`)
      }
      console.log()
    }
  })

cli
  .command(
    'bookmarks:organize <path>',
    'Organize bookmarks in a folder by rules (rule targets are created as subfolders of <path>)',
  )
  .option(
    '--rule <rule>',
    'Rule in the form "url:<pattern> -> <subfolder>" or "title:<pattern> -> <subfolder>"',
  )
  .option('--dry-run', 'Preview changes without moving bookmarks')
  .example(
    '  # Move GitHub bookmarks into D/Git\n  $ bb bookmarks:organize D --rule "url:**/github.com/** -> Git" --dry-run',
  )
  .example(
    '  # Organize by title keywords under D\n  $ bb bookmarks:organize D --rule "title:*Git* -> Git" --rule "title:*Map* -> Map"',
  )
  .action(
    async (
      path: string,
      options: GlobalOptions & {
        rule?: string | string[]
        dryRun?: boolean
      },
    ) => {
      const rules = normalizeRules(options.rule)
      if (rules.length === 0) {
        throw new Error('At least one --rule is required')
      }

      const tree = (await request(options, '/bookmarks/tree')) as bookmarks.BookmarkTreeNode[]
      const source = findNodeByPath(tree, path)
      if (!source) {
        throw new Error(`Folder not found: ${path}`)
      }
      const sourceId = source.id

      const bookmarks = (source.children || []).filter((node) => node.url !== undefined)
      const moves: Array<{ id: string; title: string; url: string; targetPath: string }> = []

      for (const bookmark of bookmarks) {
        const targetPath = matchRule(rules, bookmark)
        if (targetPath) {
          moves.push({
            id: bookmark.id,
            title: bookmark.title,
            url: bookmark.url || '',
            targetPath,
          })
        }
      }

      if (moves.length === 0) {
        console.log('No bookmarks match the given rules')
        return
      }

      if (options.dryRun) {
        console.log(`Would organize ${moves.length} bookmark(s) in "${path}":\n`)
        for (const m of moves) {
          console.log(`  [${m.targetPath}] ${m.title}`)
          console.log(`    ${m.url}`)
        }
        return
      }

      // Ensure target folders exist and move bookmarks
      const folderIds = new Map<string, string>()
      folderIds.set('', sourceId)

      async function ensureTargetFolder(targetPath: string): Promise<string> {
        if (folderIds.has(targetPath)) {
          return folderIds.get(targetPath)!
        }

        const segments = targetPath.split('/').filter(Boolean)
        let parentId = sourceId
        let currentPath = ''

        for (const segment of segments) {
          currentPath = currentPath ? `${currentPath}/${segment}` : segment
          if (folderIds.has(currentPath)) {
            parentId = folderIds.get(currentPath)!
            continue
          }

          const created = (await request(options, '/bookmarks', {
            body: JSON.stringify({ title: segment, parentId }),
            headers: { 'content-type': 'application/json' },
            method: 'POST',
          })) as bookmarks.BookmarkTreeNode
          folderIds.set(currentPath, created.id)
          parentId = created.id
        }

        return parentId
      }

      const results = await Promise.allSettled(
        moves.map(async (m) => {
          const parentId = await ensureTargetFolder(m.targetPath)
          return request(options, `/bookmarks/${encodeURIComponent(m.id)}/move`, {
            body: JSON.stringify({ parentId }),
            headers: { 'content-type': 'application/json' },
            method: 'POST',
          })
        }),
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length
      console.log(`Organized ${succeeded} bookmark(s), ${failed} failed`)

      if (failed > 0) {
        const errors = results
          .map((r, i) => ({ r, i }))
          .filter(({ r }) => r.status === 'rejected')
          .map(({ r, i }) => ({ bookmark: moves[i], reason: (r as PromiseRejectedResult).reason }))
        console.log(JSON.stringify(errors, null, 2))
      }
    },
  )

cli
  .command('daemon', 'Start the bb daemon in the foreground')
  .action(async (options: GlobalOptions) => {
    const instance = startDaemon({
      host: options.host,
      port: options.port ? Number(options.port) : undefined,
    })

    function stop(message?: string) {
      if (message) console.log(message)
      void instance.close().then(() => process.exit(0))
    }

    process.on('SIGINT', () => stop('\nShutting down daemon...'))
    process.on('SIGTERM', () => stop())
  })

cli.command('daemon:stop', 'Stop the running bb daemon').action(async (options: GlobalOptions) => {
  console.log(JSON.stringify(await request(options, '/shutdown', { method: 'POST' }), null, 2))
})

cli.help()
cli.version(packageJson.version)
cli.parse(process.argv[2] === '--' ? process.argv.toSpliced(2, 1) : process.argv)

async function request(options: GlobalOptions, path: string, init?: RequestInit) {
  const baseUrl = daemonBaseUrl(
    Number(options.port ?? DEFAULT_DAEMON_PORT),
    options.host ?? DEFAULT_DAEMON_HOST,
  )
  const url = `${baseUrl}${path}`

  let response: Response
  try {
    response = await fetch(url, init)
  } catch (error) {
    throw new Error(
      `Could not reach daemon at ${baseUrl}. Start it with "pnpm bb daemon". ${errorMessage(error)}`,
    )
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || response.statusText)
  }

  return response.json()
}

async function readBatchFile<T>(path: string): Promise<T> {
  const input = path === '-' ? await readStdin() : await readFile(path, 'utf-8')
  return JSON.parse(input) as T
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      data += chunk
    })
    process.stdin.on('end', () => resolve(data))
    process.stdin.on('error', reject)
  })
}
