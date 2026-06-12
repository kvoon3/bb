---
name: bb-daemon
description: Local HTTP/WebSocket daemon that bridges the bb CLI to a browser extension.
metadata:
  author: Kevin Kwong
  version: "2026.6.12"
  source: Generated from local package `packages/daemon`
---

> The skill is based on `@bb/daemon` v0.0.0, generated at 2026-06-12.

`@bb/daemon` is an h3-based server that exposes bookmark operations over HTTP and communicates with the browser extension over a WebSocket RPC channel.

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Starting the Daemon | `startDaemon` and the `DaemonInstance` lifecycle | [core-start-daemon](references/core-start-daemon.md) |
| HTTP Routes | Route overview and extension-state checks | [core-routes](references/core-routes.md) |
| Configuration | Environment variables and defaults | [best-practices-config](references/best-practices-config.md) |

## Features

### Bookmarks

| Topic | Description | Reference |
|-------|-------------|-----------|
| Bookmark API | Endpoints for reading, searching, and modifying bookmarks | [features-bookmarks-api](references/features-bookmarks-api.md) |
| Unused Bookmarks | HTML report for stale bookmarks | [advanced-unused-bookmarks](references/advanced-unused-bookmarks.md) |

### Extension

| Topic | Description | Reference |
|-------|-------------|-----------|
| Extension RPC | WebSocket, birpc, and the extension connection | [features-extension-rpc](references/features-extension-rpc.md) |
