export function fn() {
  return 'Hello, tsdown!'
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
