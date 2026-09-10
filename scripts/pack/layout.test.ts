import { afterEach, describe, expect, it } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizePluginLayout } from "./layout.ts";
import { findManifestPath } from "./shared.ts";

describe("normalizePluginLayout", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  function pluginDir(): string {
    const root = mkdtempSync(join(tmpdir(), "layout-"));
    const dir = join(root, "plug");

    dirs.push(root);
    mkdirSync(dir, { recursive: true });

    return dir;
  }

  it("leaves root plugin.json in place", () => {
    const dir = pluginDir();

    writeFileSync(join(dir, "plugin.json"), `${JSON.stringify({ name: "plug" })}\n`);

    normalizePluginLayout(dir);

    expect(findManifestPath(dir)).toBe(join(dir, "plugin.json"));
    expect(JSON.parse(readFileSync(join(dir, "plugin.json"), "utf8"))).toEqual({
      name: "plug",
    });
  });

  it("hoists .reforma-plugin/plugin.json to the root", () => {
    const dir = pluginDir();

    mkdirSync(join(dir, ".reforma-plugin"));
    writeFileSync(
      join(dir, ".reforma-plugin/plugin.json"),
      `${JSON.stringify({ name: "plug", interface: { displayName: "Plug" } })}\n`,
    );

    normalizePluginLayout(dir);

    expect(existsSync(join(dir, ".reforma-plugin"))).toBe(false);
    expect(JSON.parse(readFileSync(join(dir, "plugin.json"), "utf8"))).toEqual({
      name: "plug",
      interface: { displayName: "Plug" },
    });
  });

  it("hoists .cursor-plugin/plugin.json to the root", () => {
    const dir = pluginDir();

    mkdirSync(join(dir, ".cursor-plugin"));
    writeFileSync(
      join(dir, ".cursor-plugin/plugin.json"),
      `${JSON.stringify({ name: "plug" })}\n`,
    );

    normalizePluginLayout(dir);

    expect(existsSync(join(dir, ".cursor-plugin"))).toBe(false);
    expect(findManifestPath(dir)).toBe(join(dir, "plugin.json"));
  });

  it("drops leftover hidden dirs when root plugin.json already exists", () => {
    const dir = pluginDir();

    writeFileSync(join(dir, "plugin.json"), `${JSON.stringify({ name: "root" })}\n`);
    mkdirSync(join(dir, ".cursor-plugin"));
    writeFileSync(
      join(dir, ".cursor-plugin/plugin.json"),
      `${JSON.stringify({ name: "vendor" })}\n`,
    );

    normalizePluginLayout(dir);

    expect(existsSync(join(dir, ".cursor-plugin"))).toBe(false);
    expect(JSON.parse(readFileSync(join(dir, "plugin.json"), "utf8"))).toEqual({
      name: "root",
    });
  });
});
