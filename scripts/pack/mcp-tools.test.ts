import { afterEach, describe, expect, it } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  configuredToolsFromList,
  discoverMcpTools,
} from "./mcp-tools.ts";

const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function pluginDir(mcp: unknown): string {
  const root = mkdtempSync(join(tmpdir(), "pack-mcp-"));
  const dir = join(root, "plug");

  dirs.push(root);
  mkdirSync(join(dir, ".reforma-plugin"), { recursive: true });
  writeFileSync(
    join(dir, ".reforma-plugin/plugin.json"),
    `${JSON.stringify({ name: "plug" }, null, 4)}\n`,
  );
  writeFileSync(join(dir, "mcp.json"), `${JSON.stringify(mcp, null, 4)}\n`);

  return dir;
}

function jsonRpc(result: unknown, id = 1): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("configuredToolsFromList", () => {
  it("maps tools/list entries that have a name and inputSchema", () => {
    expect(
      configuredToolsFromList({
        tools: [
          {
            name: "search",
            title: "Search",
            description: "Find files",
            inputSchema: {
              type: "object",
              properties: { q: { type: "string" } },
            },
          },
          { name: "nope" },
        ],
      }),
    ).toEqual({
      search: {
        title: "Search",
        description: "Find files",
        inputSchema: {
          type: "object",
          properties: { q: { type: "string" } },
        },
      },
    });
  });

  it("returns undefined when nothing usable is listed", () => {
    expect(configuredToolsFromList({ tools: [{ name: "x" }] })).toBeUndefined();
    expect(configuredToolsFromList({})).toBeUndefined();
  });
});

describe("discoverMcpTools", () => {
  it("writes tools/list into mcp.json when the server has no tools", async () => {
    const dir = pluginDir({
      mcpServers: {
        docs: { url: "https://mcp.example/mcp" },
      },
    });
    const calls: string[] = [];

    await discoverMcpTools(dir, async (url, init) => {
      const method = JSON.parse(String(init?.body)).method as string;

      calls.push(method);

      if (method === "tools/list") {
        return jsonRpc({
          tools: [
            {
              name: "query-docs",
              description: "Fetch docs",
              inputSchema: {
                type: "object",
                properties: { q: { type: "string" } },
                required: ["q"],
              },
            },
          ],
        });
      }

      return jsonRpc({ protocolVersion: "2025-03-26", capabilities: {} });
    });

    expect(calls).toEqual(["initialize", "tools/list"]);
    expect(
      JSON.parse(readFileSync(join(dir, "mcp.json"), "utf8")).mcpServers.docs
        .tools,
    ).toEqual({
      "query-docs": {
        description: "Fetch docs",
        inputSchema: {
          type: "object",
          properties: { q: { type: "string" } },
          required: ["q"],
        },
      },
    });
  });

  it("leaves handwritten tools alone", async () => {
    const tools = {
      ping: {
        description: "Ping",
        inputSchema: { type: "object", properties: {} },
      },
    };
    const dir = pluginDir({
      mcpServers: {
        docs: { url: "https://mcp.example/mcp", tools },
      },
    });
    let fetched = 0;

    await discoverMcpTools(dir, async () => {
      fetched += 1;

      return jsonRpc({ tools: [] });
    });

    expect(fetched).toBe(0);
    expect(
      JSON.parse(readFileSync(join(dir, "mcp.json"), "utf8")).mcpServers.docs
        .tools,
    ).toEqual(tools);
  });

  it("skips probing when the server returns 401", async () => {
    const dir = pluginDir({
      mcpServers: {
        drive: { url: "https://mcp.example/mcp" },
      },
    });

    await discoverMcpTools(
      dir,
      async () => new Response("", { status: 401 }),
    );

    expect(
      JSON.parse(readFileSync(join(dir, ".reforma-plugin/plugin.json"), "utf8"))
        .auth,
    ).toBeUndefined();
    expect(
      JSON.parse(readFileSync(join(dir, "mcp.json"), "utf8")).mcpServers.drive
        .tools,
    ).toBeUndefined();
  });

  it("skips stdio servers", async () => {
    const dir = pluginDir({
      mcpServers: {
        kit: { command: "npx", args: ["-y", "everything"] },
      },
    });
    let fetched = 0;

    await discoverMcpTools(dir, async () => {
      fetched += 1;

      return jsonRpc({ tools: [] });
    });

    expect(fetched).toBe(0);
  });
});
