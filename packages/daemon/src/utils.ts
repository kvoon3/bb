import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebSocket } from 'ws'
import type { ExtensionResponse } from '@bb/protocol'

export function writeJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.writeHead(statusCode, {
    'access-control-allow-origin': '*',
    'content-type': 'application/json; charset=utf-8',
  })
  response.end(`${JSON.stringify(body, null, 2)}\n`)
}

export function writeHtml(response: ServerResponse, statusCode: number, body: string) {
  response.writeHead(statusCode, {
    'access-control-allow-origin': '*',
    'content-type': 'text/html; charset=utf-8',
  })
  response.end(body)
}

export async function readJson(request: IncomingMessage) {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

export function parseExtensionResponse(data: WebSocket.RawData): ExtensionResponse | undefined {
  try {
    let text: string
    if (Buffer.isBuffer(data)) {
      text = data.toString('utf8')
    } else if (Array.isArray(data)) {
      text = Buffer.concat(data).toString('utf8')
    } else {
      text = Buffer.from(data).toString('utf8')
    }
    const parsed = JSON.parse(text) as ExtensionResponse
    return parsed.type === 'response' ? parsed : undefined
  } catch {
    return undefined
  }
}
