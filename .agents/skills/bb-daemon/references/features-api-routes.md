---
name: bb-daemon-api-routes
description: HTTP API routes exposed by the bb daemon.
---

# Daemon API Routes

The daemon exposes a small REST-like API on `http://127.0.0.1:31337` by default. All bookmark endpoints are forwarded to the browser extension over a WebSocket JSON-RPC channel.

## Health and Lifecycle

```text
GET    /health
POST   /shutdown
```

## Bookmarks

```text
GET    /bookmarks/tree
GET    /bookmarks/search?q=<query>
GET    /bookmarks/:id
POST   /bookmarks
PATCH  /bookmarks/:id
POST   /bookmarks/:id/move
POST   /bookmarks/move-by-path
POST   /bookmarks/remove-by-path
DELETE /bookmarks/:id
DELETE /bookmarks/:id/tree
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

- The extension must be connected for bookmark endpoints to work.
- IDs are URL-encoded by clients before being sent.
- `DELETE /bookmarks/:id` and `DELETE /bookmarks/:id/tree` return `{ ok: true }` on success.

<!--
Source references:
- packages/daemon/src/routes.ts
-->
