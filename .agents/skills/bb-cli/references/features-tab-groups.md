---
name: bb-cli-tab-groups
description: List, create, update, move, and remove browser tab groups with the bb CLI.
---

# Tab Group Commands

Tab group commands are grouped under the `tabs:groups:*` namespace and require the daemon and browser extension to be running.

## List Groups

```bash
# List all tab groups
bb tabs:groups

# Filter by collapsed state, window, title, or color
bb tabs:groups --collapsed true
bb tabs:groups --window-id 1
bb tabs:groups --title "Work"
bb tabs:groups --color blue
```

## Create and Modify Groups

```bash
# Group tabs by id
bb tabs:group --tab-ids 101,102,103

# Group tabs and set the group title/color immediately
bb tabs:group --tab-ids 101,102 --title "Work" --color red
bb tabs:group --tab-ids 101,102 --collapsed true

# Add tabs to an existing group
bb tabs:group --tab-ids 104 --group-id 1

# Update an existing group
bb tabs:groups:update 1 --title "Personal"
bb tabs:groups:update 1 --color green --collapsed false

# Move a group to a different position or window
bb tabs:groups:move 1 --index 0
bb tabs:groups:move 1 --window-id 2 --index 1
```

## Ungroup Tabs

```bash
# Ungroup specific tabs without removing the group itself
bb tabs:ungroup --tab-ids 101,102

# Remove a group and ungroup all of its tabs
bb tabs:groups:remove 1
```

## Key Points

- Valid group colors are: `grey`, `blue`, `red`, `yellow`, `green`, `pink`, `purple`, `cyan`, `orange`.
- `tabs:group --tab-ids` requires at least one tab id.
- `tabs:groups:remove <groupId>` removes the group and ungroups every tab inside it.
- A 503 response means the browser extension is not connected. Check `bb health` and the extension troubleshooting reference.

<!--
Source references:
- packages/cli/src/index.ts
-->
