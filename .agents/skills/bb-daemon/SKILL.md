---
name: bb-daemon
description: Run the bb daemon directly for advanced or embedded use cases.
metadata:
  author: Kevin Kwong
  version: "2026.6.14"
  source: Generated from local package `packages/daemon`
---

> The skill is based on `@bb/daemon` v0.0.0, generated at 2026-06-14.

`@bb/daemon` is the localhost HTTP/WebSocket server that the `bb` CLI talks to. Most users do not need this skill; use the `bb-cli` skill instead. This skill is only useful when embedding or scripting the daemon directly.

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Start Daemon | Start the daemon programmatically | [core-start-daemon](references/core-start-daemon.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| API Routes | HTTP routes and request shapes | [features-api-routes](references/features-api-routes.md) |

## Best Practices

| Topic | Description | Reference |
|-------|-------------|-----------|
| Configuration | Environment variables and defaults | [best-practices-config](references/best-practices-config.md) |
| Extension Connection | How the browser extension connects | [best-practices-extension-connection](references/best-practices-extension-connection.md) |
