---
name: bb-daemon-config
description: Environment variables and default configuration for the daemon.
---

# Daemon Configuration

Connection settings are resolved from environment variables first, then shared constants.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BB_DAEMON_HOST` | `127.0.0.1` | Host the HTTP/WebSocket server binds to |
| `BB_DAEMON_PORT` | `31337` | Port the server listens on |
| `BB_EXTENSION_TIMEOUT_MS` | `10000` | birpc timeout for extension calls |

## Usage

```bash
BB_DAEMON_PORT=8080 bb daemon
```

## Key Points

- Keep the daemon bound to localhost unless you have a specific reason to expose it.
- The CLI reads the same variables so it can connect to a non-default daemon.

<!--
Source references:
- packages/daemon/src/config.ts
-->
