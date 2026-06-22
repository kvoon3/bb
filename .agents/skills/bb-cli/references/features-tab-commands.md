---
name: bb-cli-tab-commands
description: List, create, update, activate, duplicate, move, and close browser tabs with the bb CLI.
---

# Tab Commands

All tab commands are grouped under the `tabs:` namespace. They require the daemon and the browser extension to be running.

## Read Tabs

```bash
# List all open tabs
bb tabs

# Filter by active state or window
bb tabs --active true
bb tabs --current-window true
bb tabs --window-id 1

# Machine-readable output
bb tabs --json
```

## Create and Close Tabs

```bash
# Open a new tab and activate it (default)
bb tabs:create https://vitejs.dev

# Open in the background
bb tabs:create https://vitejs.dev --active false

# Pin the new tab
bb tabs:create https://vitejs.dev --pinned true

# Open at a specific position in a window
bb tabs:create https://vitejs.dev --window-id 1 --index 0

# Reload a tab
bb tabs:reload 123
bb tabs:reload 123 --bypass-cache

# Close a tab
bb tabs:close 123
```

## Update Tabs

```bash
# Activate (focus) a tab
bb tabs:activate 123

# Change the URL
bb tabs:update 123 --url https://example.com

# Pin or unpin
bb tabs:update 123 --pinned true
bb tabs:update 123 --pinned false

# Duplicate a tab
bb tabs:duplicate 123
```

## Move Tabs

```bash
# Move to the first position in the current window
bb tabs:move 123 --index 0

# Move to a different window
bb tabs:move 123 --window-id 2 --index 1
```

## Key Points

- Tab ids are numbers. They are shown by `bb tabs` and other tab commands.
- `tabs:create` activates the new tab by default; use `--active false` to open in the background.
- `tabs:reload [id]` requires an id. Omitting it raises an error.
- `tabs:close [id]` requires an id.
- A 503 response means the browser extension is not connected. Check `bb health` and the extension troubleshooting reference.

<!--
Source references:
- packages/cli/src/index.ts
-->
