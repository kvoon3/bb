---
name: bb-daemon-extension-connection
description: How the browser extension connects to the daemon.
---

# Extension Connection

The daemon accepts one WebSocket connection from the browser extension and forwards bookmark and tab operations over it.

## How It Works

1. The browser extension opens a WebSocket to `ws://127.0.0.1:31337/extension`.
2. The daemon upgrades the connection on the `/extension` pathname.
3. Bookmark and tab endpoints delegate to the extension over a JSON-RPC channel.

## Key Points

- Only one extension connection is kept alive at a time.
- If no extension is connected, bookmark and tab endpoints return `503 Browser extension is not connected`.
- The extension must be installed and enabled in the browser. See the `bb-cli` [Install the Browser Extension](../bb-cli/references/core-install-extension.md) reference for manual installation steps.

<!--
Source references:
- packages/daemon/src/index.ts
- packages/daemon/src/routes.ts
-->
