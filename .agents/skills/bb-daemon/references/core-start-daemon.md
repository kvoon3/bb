---
name: bb-daemon-start
description: Start the bb daemon programmatically.
---

# Start the Daemon Programmatically

Import `startDaemon` from `@bb/daemon` when you want to embed the server in your own script.

## Usage

```ts
import { startDaemon } from '@bb/daemon'

const instance = startDaemon({ host: '127.0.0.1', port: 31337 })

console.log(instance.url)

// Later
await instance.close()
```

## Key Points

- Options fall back to `DEFAULT_DAEMON_HOST` / `DEFAULT_DAEMON_PORT` from `@bb/shared`.
- The returned `close()` shuts down the HTTP server and terminates all WebSocket clients.
- For normal CLI usage, run `bb daemon` instead.

<!--
Source references:
- packages/daemon/src/index.ts
-->
