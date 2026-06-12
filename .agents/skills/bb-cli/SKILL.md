---
name: bb-cli
description: Use the bb CLI to install, run, and troubleshoot the browser bookmark bridge.
metadata:
  author: Kevin Kwong
  version: "2026.6.12"
  source: Generated from local package `packages/cli`
---

> The skill is based on `@kvoon/bb-cli` v0.1.1, generated at 2026-06-12.

`bb` is the command-line interface for the BB Bookmarks Bridge. It installs from npm, talks to a local daemon, and lets agents read and manage browser bookmarks. The browser extension must be installed and connected for bookmark commands to work.

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Install CLI | Install `bb` from npm | [core-install](references/core-install.md) |
| Start Daemon | Start the daemon in the foreground or as a background task | [core-start-daemon](references/core-start-daemon.md) |
| Commands | Global options and command overview | [core-commands](references/core-commands.md) |

## Features

### Bookmarks

| Topic | Description | Reference |
|-------|-------------|-----------|
| Bookmark Commands | Read, search, create, update, move, and remove bookmarks | [features-bookmarks-commands](references/features-bookmarks-commands.md) |

## Best Practices

| Topic | Description | Reference |
|-------|-------------|-----------|
| Daemon Lifecycle | Start, stop, and keep the daemon running | [best-practices-daemon-lifecycle](references/best-practices-daemon-lifecycle.md) |
| Extension Troubleshooting | What to do when the browser extension is not connected | [best-practices-extension-troubleshooting](references/best-practices-extension-troubleshooting.md) |
