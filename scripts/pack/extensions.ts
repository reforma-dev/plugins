import { readFileSync, writeFileSync } from "node:fs";
import { findManifestPath, isRecord } from "./shared.ts";

export const PLUGIN_SCHEMA =
  "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";

export const REFORMA_EXTENSION = "reforma";

/** Agent Plugins portable `plugin.json` keys. Everything else is Reforma. */
export const PORTABLE_MANIFEST_FIELDS = new Set([
  "$schema",
  "name",
  "version",
  "description",
  "author",
  "homepage",
  "repository",
  "license",
  "keywords",
  "extensions",
]);

export function reformaExtension(
  json: Record<string, unknown>,
): Record<string, unknown> {
  const extensions = isRecord(json.extensions) ? json.extensions : undefined;
  const bag = extensions?.[REFORMA_EXTENSION];

  return isRecord(bag) ? bag : {};
}

/** Hoist `extensions.reforma` so pack steps can keep reading top-level fields. */
export function unfoldReformaExtension(json: Record<string, unknown>): void {
  const bag = reformaExtension(json);

  for (const [key, value] of Object.entries(bag)) {
    if (json[key] === undefined) {
      json[key] = value;
    }
  }

  const extensions = isRecord(json.extensions) ? { ...json.extensions } : {};

  delete extensions[REFORMA_EXTENSION];

  if (Object.keys(extensions).length > 0) {
    json.extensions = extensions;
  } else {
    delete json.extensions;
  }
}

/**
 * Scoop Cursor / Claude / Codex / Reforma fields into `extensions.reforma`.
 * Portable identity stays at the top level.
 */
export function foldReformaExtension(json: Record<string, unknown>): void {
  const scooped: Record<string, unknown> = {};

  for (const key of Object.keys(json)) {
    if (!PORTABLE_MANIFEST_FIELDS.has(key)) {
      scooped[key] = json[key];
      delete json[key];
    }
  }

  const extensions = isRecord(json.extensions) ? { ...json.extensions } : {};
  const existing = isRecord(extensions[REFORMA_EXTENSION])
    ? extensions[REFORMA_EXTENSION]
    : {};
  const bag = { ...existing, ...scooped };

  if (Object.keys(bag).length > 0) {
    extensions[REFORMA_EXTENSION] = bag;
  } else {
    delete extensions[REFORMA_EXTENSION];
  }

  if (Object.keys(extensions).length > 0) {
    json.extensions = extensions;
  } else {
    delete json.extensions;
  }

  if (typeof json.$schema !== "string" || !json.$schema.trim()) {
    json.$schema = PLUGIN_SCHEMA;
  }
}

export function rewritePluginManifest(
  pluginDir: string,
  rewrite: (json: Record<string, unknown>) => void,
): void {
  const path = findManifestPath(pluginDir);

  if (!path) {
    return;
  }

  const json = JSON.parse(readFileSync(path, "utf8")) as unknown;

  if (!isRecord(json)) {
    throw new Error(`invalid plugin.json ${path}`);
  }

  rewrite(json);
  writeFileSync(path, `${JSON.stringify(orderManifest(json), null, 4)}\n`);
}

function orderManifest(json: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const key of [
    "$schema",
    "name",
    "version",
    "description",
    "author",
    "homepage",
    "repository",
    "license",
    "keywords",
    "extensions",
  ]) {
    if (json[key] !== undefined) {
      out[key] = json[key];
    }
  }

  for (const key of Object.keys(json)) {
    if (!(key in out)) {
      out[key] = json[key];
    }
  }

  return out;
}
