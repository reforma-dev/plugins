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
import { normalizePluginLogos, applyCatalogOverlay } from "./logos.ts";
import { discoverMcpTools } from "./mcp-tools.ts";
import { OUT, ROOT, TAR, parseMarketplace, type MarketplaceListing } from "./shared.ts";
import { logCatalogSummary } from "./summary.ts";
import { normalizePluginTools } from "./tools.ts";

async function packPlugin(listing: MarketplaceListing): Promise<void> {
  const dest = join(OUT, listing.name);

  if (/^https?:\/\//i.test(listing.source)) {
    await fetchGithubTree(listing.source, dest);
    normalizePluginLayout(dest);
    normalizePluginContentPaths(dest);
    normalizePluginHooks(dest);
    await normalizePluginTools(dest);
    applyCatalogOverlay(dest, listing);
    await normalizePluginLogos(dest);
    await discoverMcpTools(dest);
    stampPluginCategory(dest, listing.category);

    return;
  }

  const from = resolve(ROOT, listing.source);

  if (!existsSync(from)) {
    throw new Error(`Plugin source missing: ${listing.source}`);
  }

  mkdirSync(dest, { recursive: true });
  cpSync(from, dest, { recursive: true });
  normalizePluginLayout(dest);
  normalizePluginContentPaths(dest);
  normalizePluginHooks(dest);
  await normalizePluginTools(dest);
  applyCatalogOverlay(dest, listing);
  await normalizePluginLogos(dest);
  await discoverMcpTools(dest);
  stampPluginCategory(dest, listing.category);
}

const raw = JSON.parse(
  readFileSync(join(ROOT, "marketplace.json"), "utf8"),
) as unknown;
const marketplace = parseMarketplace(raw);

rmSync(join(ROOT, "dist"), { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const name of marketplace.skipped) {
  console.log(`skip ${name} (disabled)`);
}

for (const plugin of marketplace.plugins) {
  console.log(`pack ${plugin.name} ← ${plugin.source}`);
  await packPlugin(plugin);
}

writeFileSync(
  join(OUT, "marketplace.json"),
  `${JSON.stringify({ categories: marketplace.categories }, null, 4)}\n`,
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
