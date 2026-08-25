import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";
import { isReformaTool } from "@reforma/plugin-sdk";
import { findManifestPath, isRecord } from "./shared.ts";

/** Packed barrel — runtime `import()`s this once: `export default { Grep, Fortune, … }`. */
export const CANONICAL_TOOLS_MODULE = "./tools.mjs";
export const TOOL_SOURCE_EXT = /\.(tsx?|mts|cts)$/i;

/** Catalog/UI only — runtime reads `override` from each DefineToolOptions object. */
export type ToolOffer = { name: string; description?: string };

export function listToolSources(toolsDir: string): string[] {
  if (!existsSync(toolsDir) || !statSync(toolsDir).isDirectory()) {
    return [];
  }

  return readdirSync(toolsDir)
    .filter(
      (name) =>
        TOOL_SOURCE_EXT.test(name) &&
        !name.endsWith(".d.ts") &&
        !/\.test\./i.test(name) &&
        !/\.spec\./i.test(name),
    )
    .sort((left, right) => left.localeCompare(right));
}

export function toolSlug(fileName: string): string {
  return basename(fileName).replace(TOOL_SOURCE_EXT, "");
}

/**
 * `tools/*.ts` → single `tools.mjs` barrel (`export default { Name: defineTool… }`)
 * + manifest `tools` path + `toolOffers` (name/description for UI).
 * `@reforma/plugin-sdk` / `ai` / `zod` stay external (sandbox host resolves).
 */
export async function normalizePluginTools(pluginDir: string): Promise<void> {
  const toolsDir = join(pluginDir, "tools");
  const sources = listToolSources(toolsDir);

  if (sources.length === 0) {
    return;
  }

  const pluginName = basename(pluginDir);
  const entries: Array<{ slug: string; fileName: string }> = [];
  const seen = new Set<string>();

  for (const fileName of sources) {
    const slug = toolSlug(fileName);

    if (seen.has(slug)) {
      throw new Error(`${pluginName}/tools: duplicate tool name "${slug}"`);
    }

    seen.add(slug);
    entries.push({ slug, fileName });
  }

  const barrelSource = join(toolsDir, `__reforma_tools_barrel_${Date.now()}.ts`);
  // Validate each value after build via import; keep the entry dumb for esbuild.
  writeFileSync(
    barrelSource,
    [
      ...entries.map(
        ({ fileName }, index) =>
          `import tool${index} from ${JSON.stringify(`./${fileName}`)};`,
      ),
      `export default {`,
      ...entries.map(
        ({ slug }, index) => `  ${JSON.stringify(slug)}: tool${index},`,
      ),
      `};`,
      ``,
    ].join("\n"),
  );

  const outfile = join(pluginDir, "tools.mjs");

  try {
    await esbuild.build({
      entryPoints: [barrelSource],
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node24",
      packages: "external",
      logLevel: "silent",
    });
  } finally {
    rmSync(barrelSource, { force: true });
  }

  rmSync(toolsDir, { recursive: true, force: true });

  const mod = (await import(
    `${pathToFileURL(outfile).href}?t=${Date.now()}`
  )) as { default?: unknown };
  const table = mod.default;

  if (!isRecord(table)) {
    throw new Error(`${pluginName}/tools.mjs: default export must be a tool map`);
  }

  const offers: ToolOffer[] = [];

  for (const [name, def] of Object.entries(table)) {
    if (!isReformaTool(def)) {
      throw new Error(
        `${pluginName}/tools.mjs["${name}"]: must be defineTool(...)`,
      );
    }

    offers.push({
      name,
      ...(typeof def.description === "string" && def.description.trim()
        ? { description: def.description }
        : {}),
    });
  }

  const missing = entries
    .map((entry) => entry.slug)
    .filter((slug) => !(slug in table));

  if (missing.length > 0) {
    throw new Error(
      `${pluginName}/tools.mjs: missing tools ${missing.join(", ")}`,
    );
  }

  const manifestPath = findManifestPath(pluginDir);

  if (!manifestPath) {
    return;
  }

  const json = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;

  if (!isRecord(json)) {
    return;
  }

  json.tools = CANONICAL_TOOLS_MODULE;
  json.toolOffers = offers.sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
}

