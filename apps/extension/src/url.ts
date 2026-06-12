import { DEFAULT_DAEMON_HOST, DEFAULT_DAEMON_PORT, EXTENSION_WS_PATH } from '@bb/shared'

export function daemonWebSocketUrl(port = DEFAULT_DAEMON_PORT, host = DEFAULT_DAEMON_HOST) {
  return `ws://${host}:${port}${EXTENSION_WS_PATH}`
}
