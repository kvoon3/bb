---
name: bb-cli
description: Use the bb CLI to install, run, and troubleshoot the browser bookmark bridge.
metadata:
  author: Kevin Kwong
  version: "2026.6.14"
  source: Generated from local package `packages/cli`
---

> The skill is based on `@kvoon/bb-cli` v0.1.1, generated at 2026-06-14.

`bb` is the command-line interface for the BB Bookmarks Bridge. It installs from npm, talks to a local daemon, and lets agents read and manage browser bookmarks. The browser extension must be installed and connected for bookmark commands to work; the agent can guide you through installation but will not install it for you.

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Install CLI | Install `bb` from npm | [core-install](references/core-install.md) |
| Install Web Extension | Download the extension from GitHub Releases and load it manually | [core-install-extension](references/core-install-extension.md) |
| Start Daemon | Start the daemon in the foreground or as a background task | [core-start-daemon](references/core-start-daemon.md) |
| Commands | Global options and command overview | [core-commands](references/core-commands.md) |

## Features

### Bookmarks

| Topic | Description | Reference |
|-------|-------------|-----------|
| Bookmark Commands | Read, search, create, update, move, remove, and organize bookmarks | [features-bookmarks-commands](references/features-bookmarks-commands.md) |
| Batch Operations | Create, update, move, or remove many bookmarks from JSON files | [features-batch-operations](references/features-batch-operations.md) |
| Path Operations | Move bookmarks or remove trees by folder path | [features-path-operations](references/features-path-operations.md) |

## Best Practices

| Topic | Description | Reference |
|-------|-------------|-----------|
| Daemon Lifecycle | Start, stop, and keep the daemon running | [best-practices-daemon-lifecycle](references/best-practices-daemon-lifecycle.md) |
| Extension Troubleshooting | What to do when the browser extension is not connected | [best-practices-extension-troubleshooting](references/best-practices-extension-troubleshooting.md) |
