---
name: bb-shared-constants
description: Default host, port, and WebSocket path used by bb daemon and CLI.
---

# Shared Constants

These constants keep the CLI, daemon, and browser extension in sync about where to connect.

## Default Values

```ts
export const DEFAULT_DAEMON_HOST = '127.0.0.1'
export const DEFAULT_DAEMON_PORT = 31337
export const EXTENSION_WS_PATH = '/extension'
```

## Usage

Use them when constructing URLs or starting the daemon so you never hard-code connection details.

```ts
import { DEFAULT_DAEMON_HOST, DEFAULT_DAEMON_PORT } from '@bb/shared'

const url = `http://${DEFAULT_DAEMON_HOST}:${DEFAULT_DAEMON_PORT}`
```

## Key Points

- `DEFAULT_DAEMON_HOST` is bound to localhost for security.
- `DEFAULT_DAEMON_PORT` is `31337`.
- `EXTENSION_WS_PATH` is the exact pathname the daemon expects for browser-extension WebSocket upgrades.

<!--
Source references:
- packages/shared/src/index.ts
-->
