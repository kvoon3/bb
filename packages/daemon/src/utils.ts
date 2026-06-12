import type { IncomingMessage, ServerResponse } from 'node:http'

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
