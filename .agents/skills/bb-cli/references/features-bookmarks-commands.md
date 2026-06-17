---
name: bb-cli-bookmarks-commands
description: Bookmark management commands in the bb CLI.
---

# Bookmark Commands

All bookmark commands are grouped under the `bookmarks:` namespace. They require the daemon and the browser extension to be running.

## Read Commands

```bash
# Full bookmark tree
bb bookmarks:tree

# All folders (lightweight list for choosing a parent folder)
bb bookmarks:folders

# Search
bb bookmarks:search vite

# Get one node
bb bookmarks:get <id>
```

## Write Commands

### Create

```bash
# Create a single bookmark or folder
bb bookmarks:create --title Example --url https://example.com --parent-id 2 --index 0

# Create a folder
bb bookmarks:create --title Archive --parent-id 1

# Batch create from a JSON file
bb bookmarks:create --file bookmarks.json
```

JSON file shape for batch create:

```json
[
  { "title": "Vite", "url": "https://vitejs.dev" },
  { "title": "Archive", "parentId": "1" }
]
```

### Update

```bash
# Update a single bookmark
bb bookmarks:update <id> --title "New title" --url https://new.example.com

# Batch update from a JSON file
bb bookmarks:update --file updates.json
```

JSON file shape for batch update:

```json
[
  { "id": "123", "title": "New title" },
  { "id": "456", "url": "https://new.example.com" }
]
```

### Move

```bash
# Move to an existing folder by id
bb bookmarks:move <id> --parent-id 3 --index 1

# Move to a folder path, creating missing folders automatically
bb bookmarks:move <id> --path Websites/Personal

# Batch move from a JSON file
bb bookmarks:move --file moves.json
```

JSON file shape for batch move:

```json
[
  { "id": "123", "parentId": "3" },
  { "id": "456", "parentId": "3", "index": 0 }
]
```

You can also provide a default `--path` for items that do not specify a `parentId`:

```bash
bb bookmarks:move --file moves.json --path Websites/Personal
```

### Organize

```bash
# Preview moves without changing anything
bb bookmarks:organize D --rule "url:**/github.com/** -> Git" --dry-run

# Move GitHub bookmarks to D/Git and map-related bookmarks to D/Map
bb bookmarks:organize D \
  --rule "url:**/github.com/** -> Git" \
  --rule "title:*Map* -> Map"
```

Rules use [picomatch](https://github.com/micromatch/picomatch) glob patterns. For example, `url:**/github.com/**` matches any URL containing `github.com`, and `title:*Git*` matches titles containing `Git`. The target folder is relative to the folder being organized. Missing folders are created automatically.

### Remove

```bash
# Remove a single bookmark or empty folder
bb bookmarks:remove <id>

# Batch remove from a JSON file
bb bookmarks:remove --file ids.json

# Recursively remove a folder tree by id
bb bookmarks:remove-tree <id>

# Recursively remove a folder tree by path
bb bookmarks:remove-tree --path Archive/Old
```

## Find Unused Bookmarks

```bash
# Text output, default 90 days
bb bookmarks:unused

# Custom threshold
bb bookmarks:unused --days 30

# Machine-readable output
bb bookmarks:unused --json
```

## Key Points

- `bookmarks:create`, `bookmarks:update`, `bookmarks:move`, and `bookmarks:remove` accept `--file <path>` for batch operations. Use `--file=-` to read JSON from stdin.
- `bookmarks:organize` applies `--rule` patterns to a folder and moves matching bookmarks into subfolders. Use `--dry-run` to preview.
- `bookmarks:move --path` and `bookmarks:remove-tree --path` resolve folder paths in the browser extension. Missing folders are created automatically when moving.
- `bookmarks:remove` only removes single bookmarks or empty folders; use `remove-tree` for folders with children.
- Batch results are returned as a JSON array of `{ status: "fulfilled", value: ... }` or `{ status: "rejected", reason: ... }`.
- A 503 response means the browser extension is not connected. Check the extension status before retrying.

<!--
Source references:
- packages/cli/src/index.ts
-->
