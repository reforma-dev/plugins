/**
 * Human-readable catalog summary for pack / CI logs.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { findManifestPath, isRecord, OUT, parseMarketplace } from "./shared.ts";

const DESC_MAX = 88;

type PluginRow = {
  name: string;
  source?: string;
  category?: string;
  description?: string;
  features: string[];
};

function truncate(text: string, max: number): string {
  const oneLine = text.replace(/\s+/g, " ").trim();

  if (oneLine.length <= max) {
    return oneLine;
  }

  return `${oneLine.slice(0, max - 1).trimEnd()}…`;
}

function countEntries(dir: string): number {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    return 0;
  }

  return readdirSync(dir).filter((name) => !name.startsWith(".")).length;
}

function offerCount(raw: unknown): number {
  return Array.isArray(raw) ? raw.length : 0;
}

function featureList(
  pluginDir: string,
  manifest: Record<string, unknown>,
): string[] {
  const features: string[] = [];
  const tools =
    offerCount(manifest.toolOffers) ||
    (existsSync(join(pluginDir, "tools.mjs")) ? 1 : 0);
  const hooks =
    offerCount(manifest.hookOffers) || countEntries(join(pluginDir, "hooks"));
  const skills = countEntries(join(pluginDir, "skills"));
  const agents = countEntries(join(pluginDir, "agents"));
  const rules = countEntries(join(pluginDir, "rules"));

  if (tools > 0) {
    features.push(
      tools === 1 && !manifest.toolOffers ? "tools" : `tools×${tools}`,
    );
  }

  if (hooks > 0) {
    features.push(`hooks×${hooks}`);
  }

  if (skills > 0) {
    features.push(`skills×${skills}`);
  }

  if (agents > 0) {
    features.push(`agents×${agents}`);
  }

  if (rules > 0) {
    features.push(rules === 1 ? "rules" : `rules×${rules}`);
  }

  if (existsSync(join(pluginDir, "mcp.json"))) {
    features.push("mcp");
  }

  return features;
}

function loadPluginRow(
  catalogDir: string,
  name: string,
  source?: string,
): PluginRow {
  const pluginDir = join(catalogDir, name);
  const manifestPath = findManifestPath(pluginDir);
  let manifest: Record<string, unknown> = {};

  if (manifestPath) {
    try {
      const raw = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;

      if (isRecord(raw)) {
        manifest = raw;
      }
    } catch {
      // still list the plugin folder
    }
  }

  const category =
    typeof manifest.category === "string" && manifest.category.trim()
      ? manifest.category.trim()
      : undefined;
  const description =
    typeof manifest.description === "string" && manifest.description.trim()
      ? truncate(manifest.description, DESC_MAX)
      : undefined;
  return {
    name,
    source,
    category,
    description,
    features: featureList(pluginDir, manifest),
  };
}

function readMarketplacePlugins(
  catalogDir: string,
): Array<{ name: string; source?: string }> {
  const path = join(catalogDir, "marketplace.json");

  if (!existsSync(path)) {
    return readdirSync(catalogDir)
      .filter((name) => {
        const full = join(catalogDir, name);

        return (
          statSync(full).isDirectory() &&
          Boolean(findManifestPath(full))
        );
      })
      .map((name) => ({ name }));
  }

  try {
    return parseMarketplace(
      JSON.parse(readFileSync(path, "utf8")) as unknown,
    ).plugins;
  } catch {
    return [];
  }
}

/** Print a CI-friendly catalog summary to stdout. */
export function logCatalogSummary(
  catalogDir: string = OUT,
  title = "catalog summary",
): void {
  const listed = readMarketplacePlugins(catalogDir);
  const rows = listed.map((plugin) =>
    loadPluginRow(catalogDir, plugin.name, plugin.source),
  );

  if (rows.length === 0) {
    console.log(`\n=== ${title} · empty ===\n`);

    return;
  }

  const nameWidth = Math.min(
    28,
    Math.max(...rows.map((row) => row.name.length), 8),
  );
  const categoryWidth = Math.min(
    12,
    Math.max(
      ...rows.map((row) => (row.category ?? "—").length),
      4,
    ),
  );

  console.log("");
  console.log(`=== ${title} · ${rows.length} plugin${rows.length === 1 ? "" : "s"} ===`);

  for (const row of rows) {
    const category = (row.category ?? "—").padEnd(categoryWidth);
    const features = row.features.length > 0 ? row.features.join("  ") : "—";

    console.log(
      `${row.name.padEnd(nameWidth)}  ${category}  ${features}`,
    );

    if (row.description) {
      console.log(`${"".padEnd(nameWidth)}  ${row.description}`);
    }

    if (row.source) {
      console.log(`${"".padEnd(nameWidth)}  ← ${row.source}`);
    }
  }

  const byCategory = new Map<string, number>();
  let mcp = 0;
  let withTools = 0;
  let withHooks = 0;

  for (const row of rows) {
    const key = row.category ?? "uncategorized";
    byCategory.set(key, (byCategory.get(key) ?? 0) + 1);

    if (row.features.includes("mcp")) {
      mcp += 1;
    }

    if (row.features.some((item) => item.startsWith("tools"))) {
      withTools += 1;
    }

    if (row.features.some((item) => item.startsWith("hooks"))) {
      withHooks += 1;
    }
  }

  const categoryBits = [...byCategory.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([id, count]) => `${id}×${count}`);
  const capabilityBits = [
    mcp > 0 ? `mcp×${mcp}` : undefined,
    withTools > 0 ? `tools×${withTools}` : undefined,
    withHooks > 0 ? `hooks×${withHooks}` : undefined,
  ].filter(Boolean);

  console.log(
    `totals  ${categoryBits.join("  ")}${
      capabilityBits.length > 0 ? `  ·  ${capabilityBits.join("  ")}` : ""
    }`,
  );
  console.log("===");
  console.log("");
}
