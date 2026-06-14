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
| `bb bookmarks:search <query>`    | Search bookmarks                              |
| `bb bookmarks:get <id>`          | Get one bookmark by id                        |
| `bb bookmarks:create`            | Create one or more bookmarks or folders       |
| `bb bookmarks:update [id]`       | Update one or more bookmarks                  |
| `bb bookmarks:move [id]`         | Move one or more bookmarks to a folder/path   |
| `bb bookmarks:remove [id]`       | Remove one or more bookmarks or empty folders |
| `bb bookmarks:remove-tree [id]`  | Recursively remove a folder by id or path     |
| `bb bookmarks:unused`            | List bookmarks not visited recently           |

## Key Points

- Use `--json` when piping output to other tools.
- Most write commands support `--file <path>` for batch input.
- `bookmarks:move` and `bookmarks:remove-tree` support `--path` for path-based operations.
- If bookmark commands fail with a 503 error, the browser extension is not connected. See the extension troubleshooting reference.

<!--
Source references:
- packages/cli/src/index.ts
-->
