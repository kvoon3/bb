---
name: bb-cli-batch-operations
description: Batch create, update, move, and remove bookmarks with JSON files.
---

# Batch Operations

`bookmarks:create`, `bookmarks:update`, `bookmarks:move`, and `bookmarks:remove` accept a `--file <path>` option that points to a JSON file. Pass `-` to read from stdin.

## Batch Create

```bash
bb bookmarks:create --file bookmarks.json
```

```json
[
  { "title": "Vite", "url": "https://vitejs.dev" },
  { "title": "Vitest", "url": "https://vitest.dev" },
  { "title": "Archive", "parentId": "1" }
]
```

You can also provide a default `--path` for items that do not specify a `parentId`:

```bash
bb bookmarks:create --file bookmarks.json --path Websites/Personal
```

## Batch Update

```bash
bb bookmarks:update --file updates.json
```

```json
[
  { "id": "123", "title": "New title" },
  { "id": "456", "url": "https://new.example.com" }
]
```

## Batch Move

```bash
bb bookmarks:move --file moves.json
```

```json
[
  { "id": "123", "parentId": "3" },
  { "id": "456", "parentId": "3", "index": 0 }
]
```

## Batch Remove

```bash
bb bookmarks:remove --file ids.json
```

```json
["123", "456", "789"]
```

## Reading from stdin

```bash
cat bookmarks.json | bb bookmarks:create --file=-
```

## Output Format

Batch results are printed as a JSON array. Each item is either:

```json
{ "status": "fulfilled", "value": { ... } }
```

or

```json
{ "status": "rejected", "reason": "..." }
```

This lets you see the outcome of every item in one response.

<!--
Source references:
- packages/cli/src/index.ts
-->
