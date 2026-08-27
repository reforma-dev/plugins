/**
 * Probe HTTP MCP servers and fill `tools` into mcp.json when missing.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { findManifestPath, isRecord } from "./shared.ts";

const MCP_JSON = ["mcp.json", ".mcp.json"] as const;
const PLACEHOLDER = /\$\{[A-Za-z_][A-Za-z0-9_]*\}/;
const MCP_PROBE_MS = 5_000;
const INIT_PARAMS = {
  protocolVersion: "2025-03-26",
  capabilities: {},
  clientInfo: { name: "reforma-pack", version: "0" },
};

export type McpFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

type ConfiguredMcpTool = {
  title?: string;
  description?: string;
  inputSchema: Record<string, unknown>;
};

function mcpConfigPath(pluginDir: string): string | undefined {
  for (const rel of MCP_JSON) {
    const path = join(pluginDir, rel);

    if (existsSync(path)) {
      return path;
    }
  }
}

function mcpServerMap(raw: unknown): Record<string, unknown> | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }

  if (isRecord(raw.mcpServers)) {
    return raw.mcpServers;
  }

  const entries = Object.values(raw);

  if (
    entries.some(
      (entry) =>
        isRecord(entry) &&
        (typeof entry.url === "string" || typeof entry.command === "string"),
    )
  ) {
    return raw;
  }
}

function httpMcpUrl(entry: unknown): string | undefined {
  if (!isRecord(entry)) {
    return undefined;
  }

  if (typeof entry.command === "string" && entry.command.trim() !== "") {
    return undefined;
  }

  const url = typeof entry.url === "string" ? entry.url.trim() : "";

  if (!url || PLACEHOLDER.test(url) || !/^https?:\/\//i.test(url)) {
    return undefined;
  }

  return url;
}

export function configuredToolsFromList(
  result: unknown,
): Record<string, ConfiguredMcpTool> | undefined {
  if (!isRecord(result) || !Array.isArray(result.tools)) {
    return undefined;
  }

  const tools: Record<string, ConfiguredMcpTool> = {};

  for (const item of result.tools) {
    if (
      !isRecord(item) ||
      typeof item.name !== "string" ||
      !item.name.trim() ||
      !isRecord(item.inputSchema)
    ) {
      continue;
    }

    const title = typeof item.title === "string" ? item.title.trim() : "";
    const description =
      typeof item.description === "string" ? item.description.trim() : "";

    tools[item.name] = {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      inputSchema: item.inputSchema,
    };
  }

  return Object.keys(tools).length > 0 ? tools : undefined;
}

function serverHasDeclaredTools(entry: unknown): boolean {
  if (!isRecord(entry) || !isRecord(entry.tools)) {
    return false;
  }

  return Object.values(entry.tools).some(
    (tool) => isRecord(tool) && isRecord(tool.inputSchema),
  );
}

async function mcpRpc(
  url: string,
  method: string,
  params: Record<string, unknown>,
  fetchImpl: McpFetch,
  sessionId?: string,
): Promise<{ result: unknown; sessionId?: string } | undefined> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), MCP_PROBE_MS);

  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/event-stream",
        "Content-Type": "application/json",
        "User-Agent": "reforma-plugins",
        ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      redirect: "manual",
      signal: ac.signal,
    });

    if (!res.ok) {
      return undefined;
    }

    const nextSession = res.headers.get("mcp-session-id") ?? sessionId;
    const body = await readMcpBody(res);

    if (!isRecord(body) || body.error != null) {
      return { result: undefined, sessionId: nextSession };
    }

    return { result: body.result, sessionId: nextSession };
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

async function readMcpBody(res: Response): Promise<unknown> {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    // Streamable HTTP often wraps JSON-RPC in SSE `data:` lines.
  }

  for (const line of text.split(/\r?\n/).reverse()) {
    const data = line.match(/^data:\s*(.+)$/)?.[1];

    if (!data) {
      continue;
    }

    try {
      return JSON.parse(data);
    } catch {
      // Keep scanning.
    }
  }
}

async function probeHttpMcp(
  url: string,
  fetchImpl: McpFetch,
): Promise<Record<string, ConfiguredMcpTool> | undefined> {
  const started = await mcpRpc(url, "initialize", INIT_PARAMS, fetchImpl);

  if (!started) {
    return undefined;
  }

  const listed = await mcpRpc(
    url,
    "tools/list",
    {},
    fetchImpl,
    started.sessionId,
  );

  return configuredToolsFromList(listed?.result);
}

/** Fill missing HTTP MCP `tools` from a live tools/list probe. Stdio is skipped. */
export async function discoverMcpTools(
  pluginDir: string,
  fetchImpl: McpFetch = fetch,
): Promise<void> {
  if (!findManifestPath(pluginDir)) {
    throw new Error(`no plugin.json in ${pluginDir}`);
  }

  const mcpPath = mcpConfigPath(pluginDir);

  if (!mcpPath) {
    return;
  }

  const mcpRaw = JSON.parse(readFileSync(mcpPath, "utf8")) as unknown;
  const servers = mcpServerMap(mcpRaw);

  if (!servers) {
    return;
  }

  let mcpDirty = false;

  for (const entry of Object.values(servers)) {
    const url = httpMcpUrl(entry);

    if (!url || serverHasDeclaredTools(entry)) {
      continue;
    }

    const tools = await probeHttpMcp(url, fetchImpl);

    if (tools && isRecord(entry)) {
      entry.tools = tools;
      mcpDirty = true;
      console.log(`  mcp tools×${Object.keys(tools).length} ← ${url}`);
    }
  }

  if (mcpDirty) {
    writeFileSync(mcpPath, `${JSON.stringify(mcpRaw, null, 4)}\n`);
  }
}
