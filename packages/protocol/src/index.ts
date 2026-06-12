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
  unmodifiable?: string
  children?: BookmarkNode[]
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
  remove(id: string): Promise<void>
  removeTree(id: string): Promise<void>
}

export type BookmarkCommand =
  | {
      method: 'bookmarks.tree'
      params?: Record<string, never>
    }
  | {
      method: 'bookmarks.search'
      params: { query: string }
    }
  | {
      method: 'bookmarks.get'
      params: { id: string }
    }
  | {
      method: 'bookmarks.children'
      params: { id: string }
    }
  | {
      method: 'bookmarks.create'
      params: { parentId?: string; title?: string; url?: string; index?: number }
    }
  | {
      method: 'bookmarks.update'
      params: { id: string; title?: string; url?: string }
    }
  | {
      method: 'bookmarks.move'
      params: { id: string; parentId?: string; index?: number }
    }
  | {
      method: 'bookmarks.remove'
      params: { id: string }
    }
  | {
      method: 'bookmarks.removeTree'
      params: { id: string }
    }

export type RpcResponse =
  | {
      ok: true
      result: unknown
    }
  | {
      ok: false
      error: string
    }

export function daemonBaseUrl(port = DEFAULT_DAEMON_PORT, host = DEFAULT_DAEMON_HOST) {
  return `http://${host}:${port}`
}

export function daemonWebSocketUrl(port = DEFAULT_DAEMON_PORT, host = DEFAULT_DAEMON_HOST) {
  return `ws://${host}:${port}${EXTENSION_WS_PATH}`
}
