<h1 align="center">BB <sup style="font-size: 0.5em;">Bookmarks Bridge</sup></h1>

<p align="center">
  <a href="https://npmx.dev/package/@kvoon/bb-cli"><img src="https://img.shields.io/npm/v/@kvoon/bb-cli?style=flat&colorA=080f12&colorB=1fa669&logo=npm" alt="npm version"></a>
  <a href="https://npmx.dev/package/@kvoon/bb-cli"><img src="https://img.shields.io/npm/dm/@kvoon/bb-cli?style=flat&colorA=080f12&colorB=1fa669&logo=npm" alt="npm downloads"></a>
  <a href="https://github.com/kvoon3/bb/releases"><img src="https://img.shields.io/badge/Chrome%20Web%20Store-coming%20soon-1fa669?style=flat&logo=googlechrome&labelColor=080f12" alt="Chrome Web Store"></a>
  <a href="https://github.com/kvoon3/bb/blob/main/LICENSE"><img src="https://img.shields.io/github/license/kvoon3/bb.svg?style=flat&colorA=080f12&colorB=1fa669&logo=github" alt="License"></a>
</p>

<p align="center">AI-native browser bookmark access using a local bridge.</p>

```text
AI Agent -> CLI -> localhost daemon <-> browser extension -> bookmarks API
```

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
