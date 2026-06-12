---
name: bb-cli-commands
description: Global options and command structure of the bb CLI.
---

# CLI Commands Overview

`bb` is built with `cac` and exposes a single global namespace.

## Global Options

Every command accepts these options:

```bash
bb --host <host>    # default: 127.0.0.1
bb --port <port>    # default: 31337
bb --json           # print raw JSON responses
```

## Command Overview

Use `bb -h` to show all commands

| Command                         | Purpose                             |
| ------------------------------- | ----------------------------------- |
| `bb health`                     | Check daemon and extension status   |
| `bb daemon`                     | Start the daemon in the foreground  |
| `bb daemon:stop`                | Stop the running daemon             |
| `bb bookmarks:tree`             | Read the full bookmark tree         |
| `bb bookmarks:search <query>`   | Search bookmarks                    |
| `bb bookmarks:get <id>`         | Get one bookmark by id              |
| `bb bookmarks:create`           | Create a bookmark or folder         |
| `bb bookmarks:update <id>`      | Update a bookmark                   |
| `bb bookmarks:move <id>`        | Move a bookmark                     |
| `bb bookmarks:remove <id>`      | Remove a bookmark or empty folder   |
| `bb bookmarks:remove-tree <id>` | Recursively remove a folder         |
| `bb bookmarks:unused`           | List bookmarks not visited recently |

## Key Points

- Use `--json` when piping output to other tools.
- If bookmark commands fail with a 503 error, the browser extension is not connected. See the extension troubleshooting reference.

<!--
Source references:
- packages/cli/src/index.ts
-->
