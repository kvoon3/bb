export * from './types/index.js'

import type { bookmarks, tabs } from './types/index.js'

export const DEFAULT_DAEMON_HOST = '127.0.0.1'
export const DEFAULT_DAEMON_PORT = 31337
export const EXTENSION_WS_PATH = '/extension'

export interface MoveByPathItem {
  id: string
  path: string
  index?: number
}

export interface ExtensionRpc {
  getTree(): Promise<bookmarks.BookmarkTreeNode[]>
  getFolders(): Promise<bookmarks.BookmarkTreeNode[]>
  search(query: string | bookmarks.SearchQuery): Promise<bookmarks.BookmarkTreeNode[]>
  get(id: string): Promise<bookmarks.BookmarkTreeNode[]>
  getChildren(id: string): Promise<bookmarks.BookmarkTreeNode[]>
  create(params: bookmarks.CreateDetails): Promise<bookmarks.BookmarkTreeNode>
  update(id: string, changes: bookmarks.UpdateChanges): Promise<bookmarks.BookmarkTreeNode>
  move(id: string, changes: bookmarks.MoveDestination): Promise<bookmarks.BookmarkTreeNode>
  moveByPath(id: string, path: string, index?: number): Promise<bookmarks.BookmarkTreeNode>
  moveByPathBatch(items: MoveByPathItem[]): Promise<bookmarks.BookmarkTreeNode[]>
  remove(id: string): Promise<void>
  removeTree(id: string): Promise<void>
  removeByPath(path: string): Promise<void>
  getTabs(query?: tabs.QueryInfo): Promise<tabs.Tab[]>
  createTab(params?: tabs.CreateProperties): Promise<tabs.Tab | undefined>
  reloadTab(tabId: number, bypassCache?: boolean): Promise<void>
  closeTab(tabId: number): Promise<void>
  activateTab(tabId: number): Promise<tabs.Tab | undefined>
  updateTab(tabId: number, changes: tabs.UpdateProperties): Promise<tabs.Tab | undefined>
  duplicateTab(tabId: number): Promise<tabs.Tab | undefined>
  moveTab(tabId: number, moveProperties: tabs.MoveProperties): Promise<tabs.Tab | undefined>
}

export function getFoldersFromTree(
  nodes: bookmarks.BookmarkTreeNode[],
): bookmarks.BookmarkTreeNode[] {
  const folders: bookmarks.BookmarkTreeNode[] = []

  function walk(items: bookmarks.BookmarkTreeNode[]) {
    for (const node of items) {
      if (node.url === undefined) {
        folders.push(node)
      }
      if (node.children) {
        walk(node.children)
      }
    }
  }

  walk(nodes)
  return folders
}

export function findNodeByPath(
  tree: bookmarks.BookmarkTreeNode[],
  path: string,
): bookmarks.BookmarkTreeNode | undefined {
  const segments = path.split('/').filter(Boolean)
  const root = tree[0]?.children?.[0]
  if (!root) {
    return undefined
  }

  let current: bookmarks.BookmarkTreeNode = root
  for (const segment of segments) {
    const child = current.children?.find((node) => node.title === segment && node.url === undefined)
    if (!child) {
      return undefined
    }
    current = child
  }
  return current
}

export async function ensurePath(
  tree: bookmarks.BookmarkTreeNode[],
  path: string,
  createFolder: (params: {
    parentId: string
    title: string
  }) => Promise<bookmarks.BookmarkTreeNode>,
): Promise<bookmarks.BookmarkTreeNode> {
  const segments = path.split('/').filter(Boolean)
  const root = tree[0]?.children?.[0]
  if (!root) {
    throw new Error('Could not find bookmark root')
  }

  let current: bookmarks.BookmarkTreeNode = root
  let parentId = root.id

  for (const segment of segments) {
    const child = current.children?.find((node) => node.title === segment && node.url === undefined)
    if (child) {
      current = child
      parentId = child.id
      continue
    }

    const created = await createFolder({ parentId, title: segment })
    if (!current.children) {
      current.children = []
    }
    current.children.push(created)
    current = created
    parentId = created.id
  }

  return current
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  return String(error)
}
