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
  normalizePackedMcpServerId,
  renameLoneMcpServerKey,
} from "./content.ts";

describe("renameLoneMcpServerKey", () => {
  it("renames a vendor key to the marketplace plugin name", () => {
    expect(
      renameLoneMcpServerKey(
        {
          mcpServers: {
            chatgpt_app_mcp: {
              url: "https://mcp.dropbox.com/chatgpt_app_mcp",
            },
          },
        },
        "dropbox",
      ),
    ).toEqual({
      from: "chatgpt_app_mcp",
      next: {
        mcpServers: {
          dropbox: { url: "https://mcp.dropbox.com/chatgpt_app_mcp" },
        },
      },
    });
  });

  it("leaves a key that already matches the plugin name", () => {
    expect(
      renameLoneMcpServerKey(
        {
          mcpServers: {
            "google-drive": { url: "https://drivemcp.googleapis.com/mcp/v1" },
          },
        },
        "google-drive",
      ),
    ).toBeUndefined();
  });

  it("leaves plugins with several MCP servers", () => {
    expect(
      renameLoneMcpServerKey(
        {
          mcpServers: {
            alpha: { url: "https://a.example/mcp" },
            beta: { url: "https://b.example/mcp" },
          },
        },
        "combo",
      ),
    ).toBeUndefined();
  });
});

describe("normalizePackedMcpServerId", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rewrites mcp.json on disk", () => {
    const dir = mkdtempSync(join(tmpdir(), "dropbox-"));
    const pluginDir = join(dir, "dropbox");

    dirs.push(dir);
    mkdirSync(pluginDir, { recursive: true });
    writeFileSync(
      join(pluginDir, "mcp.json"),
      `${JSON.stringify({
        mcpServers: {
          chatgpt_app_mcp: { url: "https://mcp.dropbox.com/chatgpt_app_mcp" },
        },
      })}\n`,
    );

    normalizePackedMcpServerId(pluginDir);

    expect(JSON.parse(readFileSync(join(pluginDir, "mcp.json"), "utf8"))).toEqual({
      mcpServers: {
        dropbox: { url: "https://mcp.dropbox.com/chatgpt_app_mcp" },
      },
    });
  });
});
