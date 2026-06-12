---
name: bb-shared
description: Shared constants, types, and utilities for the bb daemon and CLI.
metadata:
  author: Kevin Kwong
  version: "2026.6.12"
  source: Generated from local package `packages/shared`
---

> The skill is based on `@bb/shared` v0.0.0, generated at 2026-06-12.

`@bb/shared` holds the common ground between the CLI and the daemon: network defaults, the WebSocket path, bookmark data types, and the RPC interface exposed by the browser extension.

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Constants | Default daemon host, port, and extension WebSocket path | [core-constants](references/core-constants.md) |
| Types | Bookmark tree node shape and extension RPC interface | [core-types](references/core-types.md) |
| Utilities | Safe error message extraction | [core-error](references/core-error.md) |
