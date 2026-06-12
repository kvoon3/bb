---
name: bb-cli-start-daemon
description: Start the bb daemon from the CLI.
---

# Start the Daemon

Bookmark commands require a running daemon. You can start it directly from the CLI.

## Start in the foreground

```bash
bb daemon
```

Press `Ctrl+C` to stop.

## Start as a background task

When running inside an agent session, start the daemon as a background task so it does not block:

```bash
bb daemon &
```

Or use your agent's background-task tool to run:

```bash
bb daemon
```

## Specify host and port

```bash
bb daemon --host 127.0.0.1 --port 31337
```

## Key Points

- The default host is `127.0.0.1` and the default port is `31337`.
- The daemon must keep running while you use bookmark commands.
- If the daemon is not reachable, the CLI reports: "Could not reach daemon at ... Start it with 'pnpm dev:daemon'."

<!--
Source references:
- packages/cli/src/index.ts
- packages/daemon/src/index.ts
-->
