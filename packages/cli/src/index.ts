#!/usr/bin/env node
import { cac } from 'cac'
import { startDaemon } from '@bb/daemon'
import { DEFAULT_DAEMON_HOST, DEFAULT_DAEMON_PORT } from '@bb/shared'
import { daemonBaseUrl } from './url.js'
import { errorMessage } from '@bb/shared'
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
    console.log(JSON.stringify(await request(options, '/health'), null, 2))
  })

cli
  .command('bookmarks:tree', 'Read the complete browser bookmark tree')
  .action(async (options: GlobalOptions) => {
    console.log(JSON.stringify(await request(options, '/bookmarks/tree'), null, 2))
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
  .command('bookmarks:create', 'Create a bookmark or folder')
  .option('--title <title>', 'Bookmark title')
  .option('--url <url>', 'Bookmark URL')
  .option('--parent-id <parentId>', 'Parent folder id')
  .option('--index <index>', 'Position index within the parent folder')
  .action(
    async (
      options: GlobalOptions & { title?: string; url?: string; parentId?: string; index?: string },
    ) => {
      const body = {
        title: options.title,
        url: options.url,
        parentId: options.parentId === undefined ? undefined : String(options.parentId),
        index: options.index === undefined ? undefined : Number(options.index),
      }
      console.log(
        JSON.stringify(
          await request(options, '/bookmarks', {
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
  .command('bookmarks:update <id>', 'Update a bookmark title or URL')
  .option('--title <title>', 'New bookmark title')
  .option('--url <url>', 'New bookmark URL')
  .action(async (id: string, options: GlobalOptions & { title?: string; url?: string }) => {
    console.log(
      JSON.stringify(
        await request(options, `/bookmarks/${encodeURIComponent(id)}`, {
          body: JSON.stringify({ title: options.title, url: options.url }),
          headers: { 'content-type': 'application/json' },
          method: 'PATCH',
        }),
        null,
        2,
      ),
    )
  })

cli
  .command('bookmarks:move <id>', 'Move a bookmark to another folder or position')
  .option('--parent-id <parentId>', 'New parent folder id')
  .option('--index <index>', 'New position index')
  .action(async (id: string, options: GlobalOptions & { parentId?: string; index?: string }) => {
    const body = {
      parentId: options.parentId === undefined ? undefined : String(options.parentId),
      index: options.index === undefined ? undefined : Number(options.index),
    }
    console.log(
      JSON.stringify(
        await request(options, `/bookmarks/${encodeURIComponent(id)}/move`, {
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
  .command('bookmarks:remove <id>', 'Remove a bookmark or empty folder')
  .action(async (id: string, options: GlobalOptions) => {
    console.log(
      JSON.stringify(
        await request(options, `/bookmarks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
        null,
        2,
      ),
    )
  })

cli
  .command('bookmarks:remove-tree <id>', 'Recursively remove a bookmark folder tree')
  .action(async (id: string, options: GlobalOptions) => {
    console.log(
      JSON.stringify(
        await request(options, `/bookmarks/${encodeURIComponent(id)}/tree`, { method: 'DELETE' }),
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
      `Could not reach daemon at ${baseUrl}. Start it with "pnpm dev:daemon". ${errorMessage(error)}`,
    )
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || response.statusText)
  }

  return response.json()
}
