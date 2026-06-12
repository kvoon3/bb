---
name: bb-daemon-extension-rpc
description: WebSocket and birpc bridge between the daemon and the browser extension.
---

# Extension RPC

The daemon accepts one WebSocket connection from the browser extension and forwards bookmark operations via `birpc`.

## How It Works

1. The browser extension opens a WebSocket to `ws://127.0.0.1:31337/extension`.
2. The daemon upgrades the connection on the `EXTENSION_WS_PATH` pathname.
3. `createBirpc` wraps the socket and exposes the `ExtensionRpc` interface.
4. Only one extension connection is kept alive; a new connection replaces the old one.

## Implementation Highlights

```ts
import { createBirpc, type BirpcReturn } from 'birpc'
import { EXTENSION_WS_PATH, type ExtensionRpc } from '@bb/shared'

extensionRpc = createBirpc<ExtensionRpc, Record<string, never>>(
  {},
  {
    post: (data) => ws.send(data),
    on: (fn) => ws.on('message', fn),
    off: (fn) => ws.off('message', fn),
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    timeout: requestTimeoutMs,
  },
)
```

## Key Points

- The daemon is the RPC **client**; the browser extension is the RPC **server** that implements `ExtensionRpc`.
- If no extension is connected, bookmark endpoints return `503`.
- A `1012 Restart` close code is sent to the previous socket when a new one connects.
- The RPC timeout defaults to 10 seconds and is configurable via `BB_EXTENSION_TIMEOUT_MS`.

<!--
Source references:
- packages/daemon/src/index.ts
- packages/daemon/src/routes.ts
-->
