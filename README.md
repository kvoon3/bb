# BB Bookmarks Bridge

AI-native browser bookmark access using a local bridge:

```text
AI Agent -> CLI -> localhost daemon <-> browser extension -> bookmarks API
```

## Packages

- `apps/extension`: Chrome/Chromium MV3 extension built with the Vite+ workspace.
- `packages/daemon`: localhost HTTP + WebSocket daemon.
- `packages/cli`: `cac` powered `bb` CLI for agents.
- `packages/protocol`: shared RPC types and constants.

## Usage

Install and build:

```bash
pnpm install
pnpm exec vp run -r build
```

Load the browser extension:

1. Open `brave://extensions` or `chrome://extensions`
2. Enable Developer mode
3. Click `Load unpacked`
4. Select `apps/extension/dist`

Start the daemon:

```bash
pnpm dev:daemon
```

Wake the extension once after the daemon starts:

```bash
open -a "Brave Browser" "chrome-extension://jfhbngojdfdagdjdajhpjpegfjcnhmel/index.html"
```

Replace the extension ID with your own ID from the browser extensions page if needed.

Use the CLI:

```bash
pnpm --silent bb health --json
pnpm --silent bb bookmarks:tree --json
pnpm --silent bb bookmarks:search openai --json
pnpm --silent bb bookmarks:get <id> --json
```

By default the daemon listens on `127.0.0.1:31337`. Override with `BB_DAEMON_HOST` and `BB_DAEMON_PORT` for the daemon, or `--host` / `--port` for the CLI.
