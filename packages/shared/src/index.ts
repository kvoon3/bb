export const DEFAULT_DAEMON_HOST = '127.0.0.1'
export const DEFAULT_DAEMON_PORT = 31337
export const EXTENSION_WS_PATH = '/extension'

export type BookmarkNode = {
  id: string
  parentId?: string
  index?: number
  url?: string
  title: string
  dateAdded?: number
  dateGroupModified?: number
  dateLastUsed?: number
  unmodifiable?: 'managed'
  syncing: boolean
  folderType?: 'bookmarks-bar' | 'other' | 'mobile' | 'managed'
  children?: BookmarkNode[]
}

export interface MoveByPathItem {
  id: string
  path: string
  index?: number
}

export interface ExtensionRpc {
  getTree(): Promise<BookmarkNode[]>
  search(query: string): Promise<BookmarkNode[]>
  get(id: string): Promise<BookmarkNode[]>
  getChildren(id: string): Promise<BookmarkNode[]>
  create(params: {
    parentId?: string
    title?: string
    url?: string
    index?: number
  }): Promise<BookmarkNode>
  update(id: string, changes: { title?: string; url?: string }): Promise<BookmarkNode>
  move(id: string, changes: { parentId?: string; index?: number }): Promise<BookmarkNode>
  moveByPath(id: string, path: string, index?: number): Promise<BookmarkNode>
  moveByPathBatch(items: MoveByPathItem[]): Promise<BookmarkNode[]>
  remove(id: string): Promise<void>
  removeTree(id: string): Promise<void>
  removeByPath(path: string): Promise<void>
}

export function findNodeByPath(tree: BookmarkNode[], path: string): BookmarkNode | undefined {
  const segments = path.split('/').filter(Boolean)
  const root = tree[0]?.children?.[0]
  if (!root) {
    return undefined
  }

  let current: BookmarkNode = root
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
  tree: BookmarkNode[],
  path: string,
  createFolder: (params: { parentId: string; title: string }) => Promise<BookmarkNode>,
): Promise<BookmarkNode> {
  const segments = path.split('/').filter(Boolean)
  const root = tree[0]?.children?.[0]
  if (!root) {
    throw new Error('Could not find bookmark root')
  }

  let current: BookmarkNode = root
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
