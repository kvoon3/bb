---
name: bb-shared-types
description: Bookmark tree and extension RPC type definitions.
---

# Shared Types

`@bb/shared` exports the TypeScript shapes used across the daemon and the browser extension.

## BookmarkNode

Represents a single bookmark or folder in the browser's bookmark tree.

```ts
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
```

A node with `url` is a bookmark; a node with `children` is a folder. `dateAdded` and `dateGroupModified` are Unix timestamps in milliseconds.

## ExtensionRpc

The RPC interface the browser extension exposes to the daemon over WebSocket.

```ts
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
```

## Key Points

- All IDs are strings (browser bookmark IDs).
- `get` and `getChildren` return arrays because the underlying Chrome APIs can return multiple items.
- Keep the RPC interface symmetric between the extension and daemon to avoid serialization mismatches.

<!--
Source references:
- packages/shared/src/index.ts
-->
