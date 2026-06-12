---
name: bb-shared-error
description: Utility for extracting a readable message from an unknown error.
---

# Error Message Utility

`errorMessage` safely converts any thrown value into a human-readable string.

## Usage

```ts
import { errorMessage } from '@bb/shared'

try {
  await fetch(url)
} catch (error) {
  throw new Error(`Request failed: ${errorMessage(error)}`)
}
```

## Implementation

```ts
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
```

## Key Points

- Use it whenever you catch `unknown` errors in TypeScript strict mode.
- Prevents `Object object` or `[object Object]` messages from leaking into user output.

<!--
Source references:
- packages/shared/src/index.ts
-->
