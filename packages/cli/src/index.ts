#!/usr/bin/env node
import { cac } from 'cac'
import { startDaemon } from '@bb/daemon'
import {
  DEFAULT_DAEMON_HOST,
  DEFAULT_DAEMON_PORT,
  daemonBaseUrl,
  type BookmarkCommand,
} from '@bb/protocol'
import { errorMessage } from '@bb/utils'
import packageJson from '../package.json' with { type: 'json' }

const cli = cac('bb')

type GlobalOptions = {
  host?: string
  port?: string | number
  json?: boolean
}

cli
  .option('--host <host>', 'Daemon host', { default: DEFAULT_DAEMON_HOST })
  .option('--port <port>', 'Daemon port', { default: String(DEFAULT_DAEMON_PORT) })
  .option('--json', 'Print raw JSON responses')

cli
  .command('health', 'Check daemon and extension status')
  .action(async (options: GlobalOptions) => {
    await printResult(await request(options, '/health'), options)
  })

cli
  .command('bookmarks:tree', 'Read the complete browser bookmark tree')
  .action(async (options: GlobalOptions) => {
    await printResult(await rpc(options, { method: 'bookmarks.tree' }), options)
  })

cli
  .command('bookmarks:search <query>', 'Search browser bookmarks')
  .action(async (query: string, options: GlobalOptions) => {
    await printResult(
      await rpc(options, { method: 'bookmarks.search', params: { query } }),
      options,
    )
  })

cli
  .command('bookmarks:get <id>', 'Read one browser bookmark node by id')
  .action(async (id: string, options: GlobalOptions) => {
    await printResult(await rpc(options, { method: 'bookmarks.get', params: { id } }), options)
  })

cli
  .command('bookmarks:create', 'Create a bookmark or folder')
  .option('--title <title>', 'Bookmark title')
  .option('--url <url>', 'Bookmark URL')
  .option('--parent-id <parentId>', 'Parent folder id')
  .option('--index <index>', 'Position index within the parent folder')
  .action(
    async (
      options: GlobalOptions & { title?: string; url?: string; parentId?: string; index?: string },
    ) => {
      await printResult(
        await rpc(options, {
          method: 'bookmarks.create',
          params: {
            title: options.title,
            url: options.url,
            parentId: options.parentId === undefined ? undefined : String(options.parentId),
            index: options.index === undefined ? undefined : Number(options.index),
          },
        }),
        options,
      )
    },
  )

cli
  .command('bookmarks:update <id>', 'Update a bookmark title or URL')
  .option('--title <title>', 'New bookmark title')
  .option('--url <url>', 'New bookmark URL')
  .action(async (id: string, options: GlobalOptions & { title?: string; url?: string }) => {
    await printResult(
      await rpc(options, {
        method: 'bookmarks.update',
        params: { id, title: options.title, url: options.url },
      }),
      options,
    )
  })

cli
  .command('bookmarks:move <id>', 'Move a bookmark to another folder or position')
  .option('--parent-id <parentId>', 'New parent folder id')
  .option('--index <index>', 'New position index')
  .action(async (id: string, options: GlobalOptions & { parentId?: string; index?: string }) => {
    await printResult(
      await rpc(options, {
        method: 'bookmarks.move',
        params: {
          id,
          parentId: options.parentId === undefined ? undefined : String(options.parentId),
          index: options.index === undefined ? undefined : Number(options.index),
        },
      }),
      options,
    )
  })

cli
  .command('bookmarks:remove <id>', 'Remove a bookmark or empty folder')
  .action(async (id: string, options: GlobalOptions) => {
    await printResult(await rpc(options, { method: 'bookmarks.remove', params: { id } }), options)
  })

cli
  .command('bookmarks:remove-tree <id>', 'Recursively remove a bookmark folder tree')
  .action(async (id: string, options: GlobalOptions) => {
    await printResult(
      await rpc(options, { method: 'bookmarks.removeTree', params: { id } }),
      options,
    )
  })

cli
  .command('bookmarks:unused', 'List bookmarks not visited recently')
  .option('--days <days>', 'Number of days threshold', { default: '90' })
  .action(async (options: GlobalOptions & { days?: string }) => {
    const days = Number(options.days ?? '90')
    const threshold = Date.now() - days * 24 * 60 * 60 * 1000

    const result = await rpc(options, { method: 'bookmarks.tree' })
    if (!isOkResult(result)) {
      await printResult(result, options)
      return
    }

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

    walk((result.result ?? []) as Array<Record<string, unknown>>, '')

    const unused = items.filter((n) => !n.dateLastUsed || n.dateLastUsed < threshold)
    unused.sort((a, b) => {
      if (!a.dateLastUsed) return 1
      if (!b.dateLastUsed) return -1
      return a.dateLastUsed - b.dateLastUsed
    })

    if (options.json) {
      console.log(JSON.stringify({ ok: true, count: unused.length, items: unused }, null, 2))
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
  .command('daemon', 'Start the bb daemon in the foreground')
  .action(async (options: GlobalOptions) => {
    const instance = startDaemon({
      host: options.host,
      port: options.port ? Number(options.port) : undefined,
    })

    process.on('SIGINT', async () => {
      console.log('\nShutting down daemon...')
      await instance.close()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      await instance.close()
      process.exit(0)
    })
  })

cli.command('daemon:stop', 'Stop the running bb daemon').action(async (options: GlobalOptions) => {
  await printResult(await request(options, '/shutdown', { method: 'POST' }), options)
})

cli.help()
cli.version(packageJson.version)
cli.parse(process.argv[2] === '--' ? process.argv.toSpliced(2, 1) : process.argv)

async function rpc(options: GlobalOptions, body: BookmarkCommand) {
  return await request(options, '/rpc', {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
}

async function request(options: GlobalOptions, path: string, init?: RequestInit) {
  const baseUrl = daemonBaseUrl(
    Number(options.port ?? DEFAULT_DAEMON_PORT),
    options.host ?? DEFAULT_DAEMON_HOST,
  )
  const url = `${baseUrl}${path}`

  try {
    const response = await fetch(url, init)
    return await response.json()
  } catch (error) {
    return {
      ok: false,
      error: `Could not reach daemon at ${baseUrl}. Start it with "pnpm dev:daemon". ${errorMessage(error)}`,
    }
  }
}

async function printResult(result: unknown, options: GlobalOptions) {
  if (options.json) {
    console.log(JSON.stringify(result, null, 2))
    if (!isOkResult(result)) {
      process.exitCode = 1
    }
    return
  }

  if (!isOkResult(result)) {
    console.error(`Error: ${errorText(result)}`)
    process.exitCode = 1
    return
  }

  console.log(JSON.stringify(result.result ?? result, null, 2))
}

function isOkResult(value: unknown): value is { ok: true; result?: unknown } {
  return Boolean(value && typeof value === 'object' && 'ok' in value && value.ok === true)
}

function errorText(value: unknown) {
  if (value && typeof value === 'object' && 'error' in value) {
    return String(value.error)
  }

  return 'Unexpected daemon response'
}
