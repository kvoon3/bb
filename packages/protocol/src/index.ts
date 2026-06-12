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
