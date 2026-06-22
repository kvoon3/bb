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

Use `bb -h` to show all commands. Use `bb <command> --help` for command-specific examples.

| Command                          | Purpose                                       |
| -------------------------------- | --------------------------------------------- |
| `bb health`                      | Check daemon and extension status             |
| `bb daemon`                      | Start the daemon in the foreground            |
| `bb daemon:stop`                 | Stop the running daemon                       |
| `bb bookmarks:tree`              | Read the full bookmark tree                   |
| `bb bookmarks:folders`           | List all bookmark folders                     |
| `bb bookmarks:search <query>`    | Search bookmarks                              |
| `bb bookmarks:get <id>`          | Get one bookmark by id                        |
| `bb bookmarks:children <id>`     | List children of a bookmark folder            |
| `bb bookmarks:create`            | Create one or more bookmarks or folders       |
| `bb bookmarks:update [id]`       | Update one or more bookmarks                  |
| `bb bookmarks:move [id]`         | Move one or more bookmarks to a folder/path   |
| `bb bookmarks:remove [id]`       | Remove one or more bookmarks or empty folders |
| `bb bookmarks:remove-tree [id]`  | Recursively remove a folder by id or path     |
| `bb bookmarks:unused`            | List bookmarks not visited recently           |
| `bb bookmarks:organize <path>`   | Organize bookmarks in a folder by rules       |
| `bb tabs`                        | List open browser tabs                        |
| `bb tabs:create <url>`           | Open a new browser tab                        |
| `bb tabs:reload <id>`            | Reload a browser tab                          |
| `bb tabs:close <id>`             | Close a browser tab                           |
| `bb tabs:activate <id>`          | Activate a browser tab                        |
| `bb tabs:update <id>`            | Update a browser tab (URL, pinned state)      |
| `bb tabs:duplicate <id>`         | Duplicate a browser tab                       |
| `bb tabs:move <id>`              | Move a browser tab to a position/window       |
| `bb tabs:groups`                 | List tab groups                               |
| `bb tabs:group`                  | Group one or more tabs                        |
| `bb tabs:ungroup`                | Ungroup one or more tabs                      |
| `bb tabs:groups:update <groupId>`| Update a tab group's title, color, or state   |
| `bb tabs:groups:move <groupId>`  | Move a tab group to a position/window         |
| `bb tabs:groups:remove <groupId>`| Ungroup all tabs in a tab group               |

## Key Points

- Use `--json` when piping output to other tools.
- Most bookmark write commands support `--file <path>` for batch input.
- `bookmarks:create` and `bookmarks:move` support `--path` for path-based operations.
- `bookmarks:remove-tree` supports `--path` for removing folder trees by path.
- `bookmarks:organize` applies rules to group bookmarks into subfolders.
- `tabs:*` and `tabs:groups:*` commands require the daemon and browser extension, just like bookmark commands.
- If bookmark or tab commands fail with a 503 error, the browser extension is not connected. See the extension troubleshooting reference.

<!--
Source references:
- packages/cli/src/index.ts
-->
