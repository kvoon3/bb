---
name: bb-cli-daemon-commands
description: Daemon lifecycle commands in the bb CLI.
---

# Daemon Commands

The CLI can start and stop the daemon directly.

## Start the Daemon

```bash
bb daemon
```

Runs the daemon in the foreground. Press `Ctrl+C` or send `SIGTERM` to shut down cleanly.

## Stop the Daemon

```bash
bb daemon:stop
```

Sends a `POST /shutdown` request to the running daemon.

## Key Points

- `bb daemon` uses `startDaemon` from `@bb/daemon` under the hood.
- `--host` and `--port` are respected by both start and stop commands.
- During development, `pnpm dev:daemon` is often more convenient because it uses `tsx watch`.

<!--
Source references:
- packages/cli/src/index.ts
-->
