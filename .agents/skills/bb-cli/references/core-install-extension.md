---
name: bb-cli-install-extension
description: Download and install the BB browser extension from a GitHub release.
---

# Install the Browser Extension

The browser extension is the bridge between the local daemon and the browser's bookmarks API. It must be installed and enabled by the user; the CLI cannot install it automatically because operating systems and browsers differ.

## Download the Release

1. Open the [BB GitHub Releases](https://github.com/kvoon3/bb/releases) page.
2. Find the latest release whose tag starts with `extension-v`.
3. Download the asset named `extension-X.X.X.zip` (for example, `extension-0.0.3.zip`).

## Install in Chrome / Chromium / Edge

1. Unzip the downloaded file.
2. Open the browser and navigate to the extensions page:
   - Chrome / Chromium: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the unzipped `dist` folder (the folder containing `manifest.json`).
6. Confirm the **BB Bookmarks Bridge** extension appears and is enabled.

## Verify the Connection

Run the CLI health check:

```bash
bb health
```

A working setup reports:

```json
{
  "daemon": "ready",
  "extensionConnected": true,
  "extensionOrigin": "chrome-extension://..."
}
```

## Key Points

- The extension is distributed only as a manual unpack-and-load package; it is not in the Chrome Web Store.
- The agent will guide you through these steps but will not attempt to install the extension for you.
- If `extensionConnected` is `false`, see the extension troubleshooting reference.

<!--
Source references:
- apps/extension/package.json
- .github/workflows/release-extension.yml
- README.md
-->
