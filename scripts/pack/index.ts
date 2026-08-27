/**
 * Resolve marketplace.json into dist/catalog/<name>/ and dist/catalog.tar.gz.
 */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  normalizePluginContentPaths,
  stampPluginCategory,
} from "./content.ts";
import { fetchGithubTree } from "./github.ts";
import { normalizePluginHooks } from "./hooks.ts";
import { normalizePluginLayout } from "./layout.ts";
import { normalizePluginLogos } from "./logos.ts";
import { discoverMcpTools } from "./mcp-tools.ts";
import { isRecord, OUT, ROOT, TAR } from "./shared.ts";
import { logCatalogSummary } from "./summary.ts";
import { normalizePluginTools } from "./tools.ts";

type Marketplace = {
  categories: unknown;
  plugins: Array<{ name: string; source: string; category?: string }>;
};

async function packPlugin(
  name: string,
  source: string,
  category: string | undefined,
): Promise<void> {
  const dest = join(OUT, name);

  if (/^https?:\/\//i.test(source)) {
    await fetchGithubTree(source, dest);
    normalizePluginLayout(dest);
    normalizePluginContentPaths(dest);
    normalizePluginHooks(dest);
    await normalizePluginTools(dest);
    await normalizePluginLogos(dest);
    await discoverMcpTools(dest);
    stampPluginCategory(dest, category);

    return;
  }

  const from = resolve(ROOT, source);

  if (!existsSync(from)) {
    throw new Error(`Plugin source missing: ${source}`);
  }

  mkdirSync(dest, { recursive: true });
  cpSync(from, dest, { recursive: true });
  normalizePluginLayout(dest);
  normalizePluginContentPaths(dest);
  normalizePluginHooks(dest);
  await normalizePluginTools(dest);
  await normalizePluginLogos(dest);
  await discoverMcpTools(dest);
  stampPluginCategory(dest, category);
}

const raw = JSON.parse(
  readFileSync(join(ROOT, "marketplace.json"), "utf8"),
) as unknown;

if (
  !isRecord(raw) ||
  !Array.isArray(raw.categories) ||
  !Array.isArray(raw.plugins)
) {
  throw new Error("marketplace.json needs categories[] and plugins[]");
}

const marketplace = raw as Marketplace;
const categoryIds = new Set(
  marketplace.categories.flatMap((item) =>
    isRecord(item) && typeof item.id === "string" && item.id.trim()
      ? [item.id.trim()]
      : [],
  ),
);
const names = new Set<string>();

rmSync(join(ROOT, "dist"), { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const plugin of marketplace.plugins) {
  if (typeof plugin.name !== "string" || typeof plugin.source !== "string") {
    throw new Error("plugins[] needs name and source");
  }

  if (names.has(plugin.name)) {
    throw new Error(`Duplicate plugin name: ${plugin.name}`);
  }

  if (plugin.category !== undefined && !categoryIds.has(plugin.category)) {
    throw new Error(
      `plugins[] ${plugin.name}: unknown category ${plugin.category}`,
    );
  }

  names.add(plugin.name);
  console.log(`pack ${plugin.name} ← ${plugin.source}`);
  await packPlugin(plugin.name, plugin.source, plugin.category);
}

writeFileSync(
  join(OUT, "marketplace.json"),
  `${JSON.stringify(marketplace, null, 4)}\n`,
);

mkdirSync(dirname(TAR), { recursive: true });
const tar = spawnSync(
  "tar",
  ["-czf", TAR, "-C", join(ROOT, "dist"), "catalog"],
  { stdio: "inherit" },
);

if (tar.status !== 0) {
  throw new Error("tar failed");
}

console.log(`wrote ${TAR}`);
logCatalogSummary(OUT, "catalog summary");
