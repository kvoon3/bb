---
name: bb-daemon-start
description: Start and stop the bb daemon programmatically or via CLI.
---

# Starting the Daemon

`startDaemon` boots the h3 HTTP server and the extension WebSocket server.

## Usage

```ts
import { startDaemon } from '@bb/daemon'

const instance = startDaemon({ host: '127.0.0.1', port: 31337 })

console.log(instance.url)

// Later
await instance.close()
```

## DaemonInstance

```ts
export interface DaemonInstance {
  server: Server
  wsServer: WebSocketServer
  url: string
  close: () => Promise<void>
}
```

## Key Points

- Options fall back to `DEFAULT_DAEMON_HOST` / `DEFAULT_DAEMON_PORT` from `@bb/shared`.
- The returned `close()` shuts down the HTTP server and terminates all WebSocket clients.
- The CLI command `bb daemon` starts the daemon in the foreground and handles `SIGINT`/`SIGTERM`.
- Call `bb daemon:stop` or POST `/shutdown` to stop a running daemon.

<!--
Source references:
- packages/daemon/src/index.ts
-->
