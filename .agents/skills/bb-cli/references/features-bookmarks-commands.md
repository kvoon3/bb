---
name: bb-cli-bookmarks-commands
description: Bookmark management commands in the bb CLI.
---

# Bookmark Commands

All bookmark commands are grouped under the `bookmarks:` namespace.

## Read Commands

```bash
# Full bookmark tree
bb bookmarks:tree

# Search
bb bookmarks:search vite

# Get one node
bb bookmarks:get <id>
```

## Write Commands

```bash
# Create a bookmark or folder
bb bookmarks:create --title Example --url https://example.com --parent-id 2 --index 0

# Update title or URL
bb bookmarks:update <id> --title "New title" --url https://new.example.com

# Move to another folder or position
bb bookmarks:move <id> --parent-id 3 --index 1

# Remove
bb bookmarks:remove <id>
bb bookmarks:remove-tree <id>
```

## Unused Bookmarks

```bash
# List bookmarks not visited in the last 90 days (text output)
bb bookmarks:unused
bb bookmarks:unused --days 30

# Raw JSON output
bb bookmarks:unused --json
```

## Key Points

- `bookmarks:remove` only removes single bookmarks or empty folders; use `remove-tree` for folders with children.
- `bookmarks:unused` performs client-side filtering against the full tree returned by the daemon.
- The CLI URL-encodes IDs before sending them to the daemon.

<!--
Source references:
- packages/cli/src/index.ts
-->
