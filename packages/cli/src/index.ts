#!/usr/bin/env node
import { cac } from "cac";
import { DEFAULT_DAEMON_HOST, DEFAULT_DAEMON_PORT, daemonBaseUrl, type BookmarkCommand } from "@bb/protocol";

const cli = cac("bb");

type GlobalOptions = {
  host?: string;
  port?: string | number;
  json?: boolean;
};

cli
  .option("--host <host>", "Daemon host", { default: DEFAULT_DAEMON_HOST })
  .option("--port <port>", "Daemon port", { default: String(DEFAULT_DAEMON_PORT) })
  .option("--json", "Print raw JSON responses");

cli.command("health", "Check daemon and extension status").action(async (options: GlobalOptions) => {
  await printResult(await request(options, "/health"), options);
});

cli.command("bookmarks:tree", "Read the complete browser bookmark tree").action(async (options: GlobalOptions) => {
  await printResult(await rpc(options, { method: "bookmarks.tree" }), options);
});

cli
  .command("bookmarks:search <query>", "Search browser bookmarks")
  .action(async (query: string, options: GlobalOptions) => {
    await printResult(await rpc(options, { method: "bookmarks.search", params: { query } }), options);
  });

cli.command("bookmarks:get <id>", "Read one browser bookmark node by id").action(async (id: string, options: GlobalOptions) => {
  await printResult(await rpc(options, { method: "bookmarks.get", params: { id } }), options);
});

cli.help();
cli.version("0.0.0");
cli.parse(normalizeArgv(process.argv));

async function rpc(options: GlobalOptions, body: BookmarkCommand) {
  return await request(options, "/rpc", {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

async function request(options: GlobalOptions, path: string, init?: RequestInit) {
  const url = `${baseUrl(options)}${path}`;

  try {
    const response = await fetch(url, init);
    return await response.json();
  } catch (error) {
    return {
      ok: false,
      error: `Could not reach daemon at ${baseUrl(options)}. Start it with "pnpm dev:daemon". ${errorMessage(error)}`,
    };
  }
}

function baseUrl(options: GlobalOptions) {
  return daemonBaseUrl(Number(options.port ?? DEFAULT_DAEMON_PORT), options.host ?? DEFAULT_DAEMON_HOST);
}

function normalizeArgv(argv: string[]) {
  return argv[2] === "--" ? argv.toSpliced(2, 1) : argv;
}

async function printResult(result: unknown, options: GlobalOptions) {
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    if (!isOkResult(result)) {
      process.exitCode = 1;
    }
    return;
  }

  if (!isOkResult(result)) {
    console.error(`Error: ${errorText(result)}`);
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify(result.result ?? result, null, 2));
}

function isOkResult(value: unknown): value is { ok: true; result?: unknown } {
  return Boolean(value && typeof value === "object" && "ok" in value && value.ok === true);
}

function errorText(value: unknown) {
  if (value && typeof value === "object" && "error" in value) {
    return String(value.error);
  }

  return "Unexpected daemon response";
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
