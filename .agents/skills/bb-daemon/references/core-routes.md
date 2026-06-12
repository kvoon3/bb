---
name: bb-daemon-routes
description: HTTP route overview for the bb daemon.
---

# HTTP Routes

The daemon exposes a small REST API plus a shutdown endpoint. All bookmark routes delegate to the browser extension over a WebSocket RPC channel.

## Route Table

| Method | Path | Description |
|--------|------|-------------|
| POST | `/shutdown` | Stop the daemon |
| GET | `/health` | Daemon readiness and extension connection state |
| GET | `/bookmarks/tree` | Full bookmark tree |
| GET | `/bookmarks/search?q=...` | Search bookmarks |
| GET | `/bookmarks/unused?days=...` | HTML report of stale bookmarks |
| GET | `/bookmarks/:id` | Get one bookmark node by id |
| POST | `/bookmarks` | Create a bookmark or folder |
| PATCH | `/bookmarks/:id` | Update a bookmark |
| POST | `/bookmarks/:id/move` | Move a bookmark to another folder/position |
| DELETE | `/bookmarks/:id` | Remove a bookmark or empty folder |
| DELETE | `/bookmarks/:id/tree` | Recursively remove a folder tree |

## Health Response

```json
{
  "daemon": "ready",
  "extensionConnected": true,
  "extensionOrigin": "chrome-extension://..."
}
```

## Key Points

- All routes live in `packages/daemon/src/routes.ts`.
- CORS is set to `*` to allow browser/extension origins.
- If the extension is not connected, bookmark routes return `503 Browser extension is not connected`.

<!--
Source references:
- packages/daemon/src/routes.ts
-->
