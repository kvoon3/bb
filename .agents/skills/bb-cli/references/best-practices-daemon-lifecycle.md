---
name: bb-cli-daemon-lifecycle
description: How to keep the bb daemon running during an agent session.
---

# Daemon Lifecycle Best Practices

The daemon must be running for any bookmark command to work.

## Typical Session

1. Start the daemon:
   ```bash
   bb daemon &
   ```
2. Verify health:
   ```bash
   bb health
   ```
3. Run bookmark commands.
4. Stop the daemon when done:
   ```bash
   bb daemon:stop
   ```

## Background Task

If your agent supports background tasks, run `bb daemon` as a background task instead of `&` so the agent can monitor it.

## Reconnecting

If the CLI reports it cannot reach the daemon:

1. Check if a daemon is already running: `bb health`
2. Start a new one if needed: `bb daemon &`
3. Verify the same `--host` and `--port` are used by both the CLI and the daemon.

## Key Points

- The daemon binds to `127.0.0.1:31337` by default.
- Use `BB_DAEMON_HOST` and `BB_DAEMON_PORT` environment variables to change defaults.
- Stop the daemon with `bb daemon:stop` or by sending `SIGINT`/`SIGTERM`.

<!--
Source references:
- packages/cli/src/index.ts
- packages/daemon/src/index.ts
- packages/daemon/src/config.ts
-->
