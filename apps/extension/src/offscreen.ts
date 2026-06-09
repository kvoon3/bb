import {
  DEFAULT_DAEMON_HOST,
  DEFAULT_DAEMON_PORT,
  daemonWebSocketUrl,
  type ExtensionRequest,
} from '@bb/protocol'

const reconnectDelayMs = 1_500
const daemonUrl = daemonWebSocketUrl(DEFAULT_DAEMON_PORT, DEFAULT_DAEMON_HOST)

let socket: WebSocket | undefined

connect()

function connect() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  ) {
    return
  }

  socket = new WebSocket(daemonUrl)

  socket.addEventListener('open', () => {
    void chrome.runtime.sendMessage({ type: 'offscreen:connected' })
  })

  socket.addEventListener('message', async (event) => {
    const requestData = String(event.data)
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'offscreen:request',
        data: requestData,
      })
      socket?.send(JSON.stringify(response))
    } catch {
      socket?.send(
        JSON.stringify({
          id: parseRequestId(requestData),
          type: 'response',
          ok: false,
          error: 'Service worker is not available',
        }),
      )
    }
  })

  socket.addEventListener('close', () => {
    void chrome.runtime.sendMessage({ type: 'offscreen:disconnected' })
    setTimeout(connect, reconnectDelayMs)
  })

  socket.addEventListener('error', () => {
    socket?.close()
  })
}

function parseRequestId(data: string): string {
  try {
    const parsed = JSON.parse(data) as ExtensionRequest
    return parsed.id
  } catch {
    return 'unknown'
  }
}
