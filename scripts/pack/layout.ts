import { existsSync, mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import {
  findManifestPath,
  pluginManifestPath,
  REFORMA_PLUGIN_DIR,
} from "./shared.ts";

const VENDOR_PLUGIN_DIRS = [
  ".cursor-plugin",
  ".claude-plugin",
  ".codex-plugin",
] as const;

/** Cursor / Codex / Claude folder → `.reforma-plugin`. Root `plugin.json` moves in. */
export function normalizePluginLayout(pluginDir: string): void {
  if (findManifestPath(pluginDir)) {
    return;
  }

  const dest = join(pluginDir, REFORMA_PLUGIN_DIR);

  for (const vendor of VENDOR_PLUGIN_DIRS) {
    const vendorDir = join(pluginDir, vendor);

    if (!existsSync(join(vendorDir, "plugin.json"))) {
      continue;
    }

    renameSync(vendorDir, dest);

    return;
  }

  const root = join(pluginDir, "plugin.json");

  if (!existsSync(root)) {
    return;
  }

  mkdirSync(dest, { recursive: true });
  renameSync(root, pluginManifestPath(pluginDir));
}

