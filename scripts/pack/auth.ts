import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { findManifestPath, isRecord } from "./shared.ts";

export const MCP_JSON = ["mcp.json", ".mcp.json"] as const;
export const PLACEHOLDER = /\$\{[A-Za-z_][A-Za-z0-9_]*\}/;
export const MCP_PROBE_MS = 5_000;

export function mcpConfigPath(pluginDir: string): string | undefined {
  for (const rel of MCP_JSON) {
    const path = join(pluginDir, rel);

    if (existsSync(path)) {
      return path;
    }
  }

  return undefined;
}

export function mcpServerMap(raw: unknown): Record<string, unknown> | undefined {
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

  return undefined;
}

export function httpMcpUrls(raw: unknown): string[] {
  const servers = mcpServerMap(raw);

  if (!servers) {
    return [];
  }

  const urls: string[] = [];

  for (const entry of Object.values(servers)) {
    if (!isRecord(entry)) {
      continue;
    }

    if (typeof entry.command === "string" && entry.command.trim() !== "") {
      continue;
    }

    const url = typeof entry.url === "string" ? entry.url.trim() : "";

    if (!url || PLACEHOLDER.test(url) || !/^https?:\/\//i.test(url)) {
      continue;
    }

    urls.push(url);
  }

  return urls;
}

export function wwwAuthenticateHasResourceMetadata(header: string | null): boolean {
  return Boolean(header && /resource_metadata\s*=/i.test(header));
}

export async function mcpInitializeUnauthorized(url: string): Promise<boolean> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), MCP_PROBE_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/event-stream",
        "Content-Type": "application/json",
        "User-Agent": "reforma-plugins",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: { name: "reforma-pack", version: "0" },
        },
      }),
      redirect: "manual",
      signal: ac.signal,
    });

    return (
      res.status === 401 &&
      wwwAuthenticateHasResourceMetadata(res.headers.get("www-authenticate"))
    );
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function normalizePluginAuth(pluginDir: string): Promise<void> {
  const manifestPath = findManifestPath(pluginDir);

  if (!manifestPath) {
    throw new Error(`no plugin.json in ${pluginDir}`);
  }

  const json = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;

  if (!isRecord(json)) {
    throw new Error(`invalid plugin.json ${manifestPath}`);
  }

  if (json.auth === "oauth") {
    return;
  }

  const mcpPath = mcpConfigPath(pluginDir);

  if (!mcpPath) {
    return;
  }

  const urls = httpMcpUrls(
    JSON.parse(readFileSync(mcpPath, "utf8")) as unknown,
  );

  for (const url of urls) {
    if (await mcpInitializeUnauthorized(url)) {
      json.auth = "oauth";
      writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
      console.log(`  auth oauth ← ${url}`);

      return;
    }
  }
}

