---
name: bb-daemon-bookmarks-api
description: Bookmark CRUD and search endpoints exposed by the daemon.
---

# Bookmark API

The daemon mirrors the browser extension's bookmark capabilities through HTTP endpoints.

## Read Operations

### Get the full tree

```bash
curl http://127.0.0.1:31337/bookmarks/tree
```

### Search

```bash
curl "http://127.0.0.1:31337/bookmarks/search?q=vite"
```

### Get one node

```bash
curl http://127.0.0.1:31337/bookmarks/<id>
```

## Write Operations

### Create

```bash
curl -X POST http://127.0.0.1:31337/bookmarks \
  -H 'content-type: application/json' \
  -d '{"title":"Example","url":"https://example.com","parentId":"2","index":0}'
```

### Update

```bash
curl -X PATCH http://127.0.0.1:31337/bookmarks/<id> \
  -H 'content-type: application/json' \
  -d '{"title":"New title","url":"https://new.example.com"}'
```

### Move

```bash
curl -X POST http://127.0.0.1:31337/bookmarks/<id>/move \
  -H 'content-type: application/json' \
  -d '{"parentId":"3","index":1}'
```

### Remove

```bash
curl -X DELETE http://127.0.0.1:31337/bookmarks/<id>
curl -X DELETE http://127.0.0.1:31337/bookmarks/<id>/tree
```

## Key Points

- IDs are browser bookmark IDs and must be URL-encoded when used in paths.
- The `id` field in request bodies is ignored by `PATCH` and `move` to avoid accidental overwrites.
- `remove` only works on single bookmarks or empty folders; use `removeTree` for recursive deletion.

<!--
Source references:
- packages/daemon/src/routes.ts
-->
