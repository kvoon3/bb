# BB Bookmarks Bridge

AI-native browser bookmark access using a local bridge:

```text
AI Agent -> CLI -> localhost daemon <-> browser extension -> bookmarks API
```

## Packages

- `apps/extension`: Chrome/Chromium MV3 extension built with the Vite+ workspace.
- `packages/daemon`: localhost HTTP + WebSocket daemon.
- `packages/cli`: `cac` powered `bb` CLI for agents.
- `packages/shared`: shared types and constants used across packages.
