import { existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { findManifestPath } from "./shared.ts";

/** Hidden vendor / legacy Reforma folders. Packed canon is root `plugin.json`. */
export const HIDDEN_PLUGIN_DIRS = [
  ".reforma-plugin",
  ".cursor-plugin",
  ".claude-plugin",
  ".codex-plugin",
] as const;

/**
 * Hoist a hidden `plugin.json` (and sibling files) to the plugin root.
 * Leftover hidden dirs are dropped so the catalog only ships the spec layout.
 */
export function normalizePluginLayout(pluginDir: string): void {
  if (!findManifestPath(pluginDir)) {
    for (const dir of HIDDEN_PLUGIN_DIRS) {
      if (hoistHiddenPluginDir(pluginDir, dir)) {
        break;
      }
    }
  }

  for (const dir of HIDDEN_PLUGIN_DIRS) {
    rmSync(join(pluginDir, dir), { recursive: true, force: true });
  }
}

function hoistHiddenPluginDir(pluginDir: string, hiddenName: string): boolean {
  const hidden = join(pluginDir, hiddenName);
  const manifest = join(hidden, "plugin.json");

  if (!existsSync(manifest)) {
    return false;
  }

  for (const name of readdirSync(hidden)) {
    const from = join(hidden, name);
    const to = join(pluginDir, name);

    if (existsSync(to)) {
      throw new Error(
        `${basename(pluginDir)}: cannot hoist ${hiddenName}/${name} (exists at plugin root)`,
      );
    }

    renameSync(from, to);
  }

  rmSync(hidden, { recursive: true, force: true });

  return true;
}
