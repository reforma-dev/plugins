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
  normalizePluginContentPaths,
  renameLoneMcpServerKey,
  stampPluginCategory,
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

  it("lowercases every server key when a plugin ships several", () => {
    const dir = mkdtempSync(join(tmpdir(), "motion-"));
    const pluginDir = join(dir, "motion");

    dirs.push(dir);
    mkdirSync(pluginDir, { recursive: true });
    writeFileSync(
      join(pluginDir, "mcp.json"),
      `${JSON.stringify({
        mcpServers: {
          Motion: { url: "https://mcp.motion.dev" },
          "Motion+": { url: "https://mcp.motion.dev/plus" },
        },
      })}\n`,
    );

    normalizePackedMcpServerId(pluginDir);

    expect(JSON.parse(readFileSync(join(pluginDir, "mcp.json"), "utf8"))).toEqual({
      mcpServers: {
        motion: { url: "https://mcp.motion.dev" },
        "motion+": { url: "https://mcp.motion.dev/plus" },
      },
    });
  });

  it("wraps a Cursor top-level map and renames the lone server key", () => {
    const dir = mkdtempSync(join(tmpdir(), "notion-"));
    const pluginDir = join(dir, "notion-workspace");

    dirs.push(dir);
    mkdirSync(pluginDir, { recursive: true });
    writeFileSync(
      join(pluginDir, "mcp.json"),
      `${JSON.stringify({
        notion: { type: "http", url: "https://mcp.notion.com/mcp" },
      })}\n`,
    );

    normalizePackedMcpServerId(pluginDir);

    expect(JSON.parse(readFileSync(join(pluginDir, "mcp.json"), "utf8"))).toEqual({
      mcpServers: {
        "notion-workspace": {
          type: "http",
          url: "https://mcp.notion.com/mcp",
        },
      },
    });
  });
});

describe("normalizePluginContentPaths", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("remaps Codex .mcp.json and strips manifest path fields", () => {
    const dir = mkdtempSync(join(tmpdir(), "codex-"));
    const pluginDir = join(dir, "dropbox");

    dirs.push(dir);
    mkdirSync(join(pluginDir, ".reforma-plugin"), { recursive: true });
    mkdirSync(join(pluginDir, "skills", "find-dropbox-content"), {
      recursive: true,
    });
    writeFileSync(
      join(pluginDir, ".reforma-plugin/plugin.json"),
      `${JSON.stringify(
        {
          name: "dropbox",
          mcpServers: "./.mcp.json",
          skills: "./skills/",
        },
        null,
        4,
      )}\n`,
    );
    writeFileSync(
      join(pluginDir, ".mcp.json"),
      `${JSON.stringify({
        mcpServers: {
          chatgpt_app_mcp: {
            url: "https://mcp.dropbox.com/chatgpt_app_mcp",
          },
        },
      })}\n`,
    );
    writeFileSync(
      join(pluginDir, "skills/find-dropbox-content/SKILL.md"),
      "---\ndescription: Search Dropbox.\n---\n\n# Find\n",
    );

    normalizePluginContentPaths(pluginDir);

    expect(
      JSON.parse(readFileSync(join(pluginDir, "mcp.json"), "utf8")),
    ).toEqual({
      mcpServers: {
        dropbox: { url: "https://mcp.dropbox.com/chatgpt_app_mcp" },
      },
    });
    expect(
      JSON.parse(
        readFileSync(join(pluginDir, ".reforma-plugin/plugin.json"), "utf8"),
      ),
    ).toEqual({ name: "dropbox" });
  });
});

describe("stampPluginCategory", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("writes category onto a pin with no plugin.json category", () => {
    const dir = mkdtempSync(join(tmpdir(), "stamp-"));
    const pluginDir = join(dir, "dropbox");

    dirs.push(dir);
    mkdirSync(join(pluginDir, ".reforma-plugin"), { recursive: true });
    writeFileSync(
      join(pluginDir, ".reforma-plugin/plugin.json"),
      `${JSON.stringify({ name: "dropbox" }, null, 4)}\n`,
    );

    stampPluginCategory(pluginDir, "files");

    expect(
      JSON.parse(
        readFileSync(join(pluginDir, ".reforma-plugin/plugin.json"), "utf8"),
      ),
    ).toMatchObject({ name: "dropbox", category: "files" });
  });
});
