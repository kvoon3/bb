# BB (Bookmarks Bridge)

AI-native browser bookmark access using a local bridge:

```text
AI Agent -> CLI -> localhost daemon <-> browser extension -> bookmarks API
```

## Packages

- `apps/extension`: Chrome/Chromium MV3 extension built with the Vite+ workspace.
- `packages/daemon`: localhost HTTP + WebSocket daemon.
- `packages/cli`: `cac` powered `bb` CLI for agents.
- `packages/shared`: shared types and constants used across packages.

## Skills

```bash
npx skills add kvoon3/bb
```

## Web Extension

Download the latest extension package from [GitHub Releases](https://github.com/kvoon3/bb/releases).

## CLI Usage

Install the CLI globally:

```bash
npm -g i @kvoon/bb-cli
```

Run `bb -h` to see available commands:

<!-- cli-help-start -->

```bash
$ bb -h
bb/0.1.0

Usage:
  $ bb <command> [options]

Commands:
  health                      Check daemon and extension status
  bookmarks:tree              Read the complete browser bookmark tree
  bookmarks:search <query>    Search browser bookmarks
  bookmarks:get <id>          Read one browser bookmark node by id
  bookmarks:create            Create a bookmark or folder
  bookmarks:update <id>       Update a bookmark title or URL
  bookmarks:move <id>         Move a bookmark to another folder or position
  bookmarks:remove <id>       Remove a bookmark or empty folder
  bookmarks:remove-tree <id>  Recursively remove a bookmark folder tree
  bookmarks:unused            List bookmarks not visited recently
  daemon                      Start the bb daemon in the foreground
  daemon:stop                 Stop the running bb daemon

For more info, run any command with the `--help` flag:
  $ bb health --help
  $ bb bookmarks:tree --help
  $ bb bookmarks:search --help
  $ bb bookmarks:get --help
  $ bb bookmarks:create --help
  $ bb bookmarks:update --help
  $ bb bookmarks:move --help
  $ bb bookmarks:remove --help
  $ bb bookmarks:remove-tree --help
  $ bb bookmarks:unused --help
  $ bb daemon --help
  $ bb daemon:stop --help

Options:
  --host <host>  Daemon host (default: 127.0.0.1)
  --port <port>  Daemon port (default: 31337)
  --json         Print raw JSON responses
  -h, --help     Display this message
  -v, --version  Display version number
```

<!-- cli-help-end -->

## License

[MIT](LICENSE) © Kevin Kwong
