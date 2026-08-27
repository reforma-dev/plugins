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
  configuredResourceTemplatesFromList,
  configuredResourcesFromList,
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

function readServer(dir: string, id = "docs") {
  return JSON.parse(readFileSync(join(dir, "mcp.json"), "utf8")).mcpServers[id];
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

describe("configuredResourcesFromList", () => {
  it("maps resources/list entries that have a uri", () => {
    expect(
      configuredResourcesFromList({
        resources: [
          {
            uri: "doc://quickstart",
            name: "Quickstart",
            mimeType: "text/markdown",
          },
          { name: "nope" },
        ],
      }),
    ).toEqual([
      {
        uri: "doc://quickstart",
        name: "Quickstart",
        mimeType: "text/markdown",
      },
    ]);
  });

  it("returns undefined when nothing usable is listed", () => {
    expect(
      configuredResourcesFromList({ resources: [{ name: "x" }] }),
    ).toBeUndefined();
    expect(configuredResourcesFromList({})).toBeUndefined();
  });
});

describe("configuredResourceTemplatesFromList", () => {
  it("maps templates that have a uriTemplate", () => {
    expect(
      configuredResourceTemplatesFromList({
        resourceTemplates: [
          {
            uriTemplate: "doc://{slug}",
            name: "Doc",
            mimeType: "text/markdown",
          },
        ],
      }),
    ).toEqual([
      {
        uriTemplate: "doc://{slug}",
        name: "Doc",
        mimeType: "text/markdown",
      },
    ]);
  });
});

describe("discoverMcpTools", () => {
  it("writes tools and resources into mcp.json when missing", async () => {
    const dir = pluginDir({
      mcpServers: {
        docs: { url: "https://mcp.example/mcp" },
      },
    });
    const calls: string[] = [];

    await discoverMcpTools(dir, async (_url, init) => {
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

      if (method === "resources/list") {
        return jsonRpc({
          resources: [
            {
              uri: "doc://quickstart",
              name: "Quickstart",
              mimeType: "text/markdown",
            },
          ],
        });
      }

      if (method === "resources/templates/list") {
        return jsonRpc({
          resourceTemplates: [
            { uriTemplate: "doc://{slug}", name: "Doc" },
          ],
        });
      }

      return jsonRpc({ protocolVersion: "2025-03-26", capabilities: {} });
    });

    expect(calls).toEqual([
      "initialize",
      "tools/list",
      "resources/list",
      "resources/templates/list",
    ]);
    expect(readServer(dir)).toMatchObject({
      tools: {
        "query-docs": {
          description: "Fetch docs",
          inputSchema: {
            type: "object",
            properties: { q: { type: "string" } },
            required: ["q"],
          },
        },
      },
      resources: [
        {
          uri: "doc://quickstart",
          name: "Quickstart",
          mimeType: "text/markdown",
        },
      ],
      resourceTemplates: [{ uriTemplate: "doc://{slug}", name: "Doc" }],
    });
  });

  it("leaves handwritten tools alone and still probes resources", async () => {
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
    const calls: string[] = [];

    await discoverMcpTools(dir, async (_url, init) => {
      const method = JSON.parse(String(init?.body)).method as string;

      calls.push(method);

      if (method === "resources/list") {
        return jsonRpc({
          resources: [{ uri: "doc://guide", name: "Guide" }],
        });
      }

      return jsonRpc({ protocolVersion: "2025-03-26", capabilities: {} });
    });

    expect(calls).toEqual([
      "initialize",
      "resources/list",
      "resources/templates/list",
    ]);
    expect(readServer(dir).tools).toEqual(tools);
    expect(readServer(dir).resources).toEqual([
      { uri: "doc://guide", name: "Guide" },
    ]);
  });

  it("leaves handwritten resources and templates alone", async () => {
    const resources = [{ uri: "doc://guide", name: "Guide" }];
    const resourceTemplates = [{ uriTemplate: "doc://{slug}", name: "Doc" }];
    const dir = pluginDir({
      mcpServers: {
        docs: {
          url: "https://mcp.example/mcp",
          resources,
          resourceTemplates,
        },
      },
    });
    const calls: string[] = [];

    await discoverMcpTools(dir, async (_url, init) => {
      const method = JSON.parse(String(init?.body)).method as string;

      calls.push(method);

      if (method === "tools/list") {
        return jsonRpc({
          tools: [
            {
              name: "ping",
              inputSchema: { type: "object", properties: {} },
            },
          ],
        });
      }

      return jsonRpc({ protocolVersion: "2025-03-26", capabilities: {} });
    });

    expect(calls).toEqual(["initialize", "tools/list"]);
    expect(readServer(dir).resources).toEqual(resources);
    expect(readServer(dir).resourceTemplates).toEqual(resourceTemplates);
    expect(readServer(dir).tools).toEqual({
      ping: { inputSchema: { type: "object", properties: {} } },
    });
  });

  it("skips probing when tools, resources, and templates are declared", async () => {
    const dir = pluginDir({
      mcpServers: {
        docs: {
          url: "https://mcp.example/mcp",
          tools: {
            ping: {
              description: "Ping",
              inputSchema: { type: "object", properties: {} },
            },
          },
          resources: [{ uri: "doc://guide" }],
          resourceTemplates: [{ uriTemplate: "doc://{slug}" }],
        },
      },
    });
    let fetched = 0;

    await discoverMcpTools(dir, async () => {
      fetched += 1;

      return jsonRpc({ tools: [] });
    });

    expect(fetched).toBe(0);
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
    expect(readServer(dir, "drive").tools).toBeUndefined();
    expect(readServer(dir, "drive").resources).toBeUndefined();
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
