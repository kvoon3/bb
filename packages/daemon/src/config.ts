import { DEFAULT_DAEMON_HOST, DEFAULT_DAEMON_PORT } from '@bb/protocol'

export const port = Number(process.env.BB_DAEMON_PORT ?? DEFAULT_DAEMON_PORT)
export const host = process.env.BB_DAEMON_HOST ?? DEFAULT_DAEMON_HOST
export const requestTimeoutMs = Number(process.env.BB_EXTENSION_TIMEOUT_MS ?? 10_000)
