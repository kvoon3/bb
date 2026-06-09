import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import {
  DEFAULT_DAEMON_HOST,
  DEFAULT_DAEMON_PORT,
  EXTENSION_WS_PATH,
  type BookmarkCommand,
  type ExtensionRequest,
  type ExtensionResponse,
  type RpcResponse,
} from "@bb/protocol";
import { WebSocketServer, type WebSocket } from "ws";

const port = Number(process.env.BB_DAEMON_PORT ?? DEFAULT_DAEMON_PORT);
const host = process.env.BB_DAEMON_HOST ?? DEFAULT_DAEMON_HOST;
const requestTimeoutMs = Number(process.env.BB_EXTENSION_TIMEOUT_MS ?? 10_000);

let extensionSocket: WebSocket | undefined;
let extensionOrigin: string | undefined;

const server = createServer(async (request, response) => {
  try {
    await routeHttp(request, response);
  } catch (error) {
    writeJson(response, 500, { ok: false, error: errorMessage(error) });
  }
});

const wsServer = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  if (new URL(request.url ?? "/", `http://${host}:${port}`).pathname !== EXTENSION_WS_PATH) {
    socket.destroy();
    return;
  }

  wsServer.handleUpgrade(request, socket, head, (webSocket) => {
    wsServer.emit("connection", webSocket, request);
  });
});

wsServer.on("connection", (webSocket, request) => {
  extensionSocket?.close(1012, "Replaced by a newer extension connection");
  extensionSocket = webSocket;
  extensionOrigin = request.headers.origin;

  webSocket.on("close", () => {
    if (extensionSocket === webSocket) {
      extensionSocket = undefined;
      extensionOrigin = undefined;
    }
  });
});

server.listen(port, host, () => {
  console.log(`bb daemon listening on http://${host}:${port}`);
});

async function routeHttp(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);

  if (request.method === "GET" && url.pathname === "/health") {
    writeJson(response, 200, {
      ok: true,
      daemon: "ready",
      extensionConnected: extensionSocket !== undefined && extensionSocket.readyState === extensionSocket.OPEN,
      extensionOrigin,
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/bookmarks/tree") {
    writeJson(response, 200, await sendToExtension({ method: "bookmarks.tree" }));
    return;
  }

  if (request.method === "GET" && url.pathname === "/bookmarks/search") {
    const query = url.searchParams.get("q") ?? "";
    writeJson(response, 200, await sendToExtension({ method: "bookmarks.search", params: { query } }));
    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/bookmarks/")) {
    const id = decodeURIComponent(url.pathname.split("/").at(-1) ?? "");
    writeJson(response, 200, await sendToExtension({ method: "bookmarks.get", params: { id } }));
    return;
  }

  if (request.method === "POST" && url.pathname === "/rpc") {
    const body = (await readJson(request)) as BookmarkCommand;
    writeJson(response, 200, await sendToExtension(body));
    return;
  }

  writeJson(response, 404, { ok: false, error: "Not found" });
}

async function sendToExtension(command: BookmarkCommand): Promise<RpcResponse> {
  if (!extensionSocket || extensionSocket.readyState !== extensionSocket.OPEN) {
    return { ok: false, error: "Browser extension is not connected" };
  }

  const socket = extensionSocket;
  const id = randomUUID();
  const message: ExtensionRequest = { id, type: "request", ...command };

  return await new Promise<RpcResponse>((resolve) => {
    const timeout = setTimeout(() => {
      cleanup();
      resolve({ ok: false, error: "Timed out waiting for browser extension" });
    }, requestTimeoutMs);

    const handleMessage = (data: WebSocket.RawData) => {
      const response = parseExtensionResponse(data);
      if (!response || response.id !== id) {
        return;
      }

      cleanup();
      resolve(response.ok ? { ok: true, result: response.result } : { ok: false, error: response.error });
    };

    const handleClose = () => {
      cleanup();
      resolve({ ok: false, error: "Browser extension disconnected" });
    };

    const cleanup = () => {
      clearTimeout(timeout);
      socket.off("message", handleMessage);
      socket.off("close", handleClose);
    };

    socket.on("message", handleMessage);
    socket.on("close", handleClose);
    socket.send(JSON.stringify(message));
  });
}

async function readJson(request: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function parseExtensionResponse(data: WebSocket.RawData): ExtensionResponse | undefined {
  try {
    const parsed = JSON.parse(data.toString()) as ExtensionResponse;
    return parsed.type === "response" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function writeJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.writeHead(statusCode, {
    "access-control-allow-origin": "*",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(`${JSON.stringify(body, null, 2)}\n`);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
