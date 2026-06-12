import { DEFAULT_DAEMON_HOST, DEFAULT_DAEMON_PORT } from '@bb/shared'

export function daemonBaseUrl(port = DEFAULT_DAEMON_PORT, host = DEFAULT_DAEMON_HOST) {
  return `http://${host}:${port}`
}
