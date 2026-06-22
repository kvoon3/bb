---
name: bb-daemon-api-routes
description: HTTP API routes exposed by the bb daemon.
---

# Daemon API Routes

The daemon exposes a small REST-like API on `http://127.0.0.1:31337` by default. Bookmark and tab endpoints are forwarded to the browser extension over a WebSocket JSON-RPC channel.

## Health and Lifecycle

```text
GET    /health
POST   /shutdown
```

## Bookmarks

```text
GET    /bookmarks/tree
GET    /bookmarks/folders
GET    /bookmarks/search?q=<query>
GET    /bookmarks/unused?days=<days>
GET    /bookmarks/:id
GET    /bookmarks/:id/children
POST   /bookmarks
PATCH  /bookmarks/:id
POST   /bookmarks/:id/move
POST   /bookmarks/move-by-path
POST   /bookmarks/remove-by-path
DELETE /bookmarks/:id
DELETE /bookmarks/:id/tree
```

## Tabs

```text
GET    /tabs
POST   /tabs
POST   /tabs/:id/reload
DELETE /tabs/:id
POST   /tabs/:id/activate
PATCH  /tabs/:id
POST   /tabs/:id/duplicate
POST   /tabs/:id/move
GET    /tabs/groups
POST   /tabs/group
POST   /tabs/ungroup
PATCH  /tabs/groups/:id
POST   /tabs/groups/:id/move
DELETE /tabs/groups/:id
```

## Path-based Endpoints

`POST /bookmarks/move-by-path` moves a bookmark to a folder path, creating missing folders in the extension:

```json
{
  "id": "123",
  "path": "Websites/Personal",
  "index": 0
}
```

`POST /bookmarks/remove-by-path` recursively removes a folder tree by path:

```json
{
  "path": "Archive/Old"
}
```

## Key Points

- The extension must be connected for bookmark and tab endpoints to work.
- Bookmark IDs are URL-encoded by clients before being sent.
- `DELETE /bookmarks/:id` and `DELETE /bookmarks/:id/tree` return `{ ok: true }` on success.
- Tab and tab-group endpoints use numeric ids.

<!--
Source references:
- packages/daemon/src/routes.ts
-->
