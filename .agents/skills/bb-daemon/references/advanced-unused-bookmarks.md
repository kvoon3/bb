---
name: bb-daemon-unused-bookmarks
description: HTML report endpoint for bookmarks not visited recently.
---

# Unused Bookmarks Report

`GET /bookmarks/unused?days=90` returns an HTML table of bookmarks whose `dateLastUsed` is older than the threshold.

## Usage

```bash
open http://127.0.0.1:31337/bookmarks/unused?days=30
```

## Behavior

- Walks the entire bookmark tree returned by the extension.
- Filters nodes that have a `url` and either no `dateLastUsed` or one older than `Date.now() - days * 24 * 60 * 60 * 1000`.
- Sorts results with never-used bookmarks at the end, then oldest first.
- Renders a self-contained HTML page with title, URL, folder path, and last-used date.

## Key Points

- This is a daemon-side feature: the CLI has a matching text-mode `bookmarks:unused` command.
- The response is `text/html; charset=utf-8`.
- Bookmark IDs are not shown in the HTML table; use the API or CLI to act on findings.

<!--
Source references:
- packages/daemon/src/routes.ts
-->
