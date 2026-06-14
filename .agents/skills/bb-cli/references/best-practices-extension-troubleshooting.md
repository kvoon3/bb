---
name: bb-cli-extension-troubleshooting
description: Diagnose and fix browser extension connection issues.
---

# Browser Extension Troubleshooting

Bookmark commands fail with a 503 error when the browser extension is not connected to the daemon.

## Check Extension Status

```bash
bb health
```

A healthy setup reports:

```json
{
  "daemon": "ready",
  "extensionConnected": true,
  "extensionOrigin": "chrome-extension://..."
}
```

If `extensionConnected` is `false`, the extension is not connected.

## Install or Reinstall the Extension

Follow the [Install the Browser Extension](core-install-extension.md) reference to download the latest `extension-X.X.X.zip` from GitHub Releases and load it manually in Chrome, Chromium, or Edge.

## Common Fixes

- Make sure the extension is enabled in `chrome://extensions/`.
- Make sure the daemon is running and reachable at the host/port shown by `bb health`.
- Reload the extension if the daemon was restarted.
- Check that the browser's origin is allowed; the daemon sets `access-control-allow-origin: *`.

## Key Points

- The extension connects to the daemon over WebSocket at `/extension`.
- Only one browser extension connection is kept alive at a time.
- Without the extension, daemon health still works, but bookmark commands return 503.
- Path-based operations (`--path`) are resolved in the extension, so they also require a connected extension.

<!--
Source references:
- packages/daemon/src/index.ts
- packages/daemon/src/routes.ts
- README.md
-->
