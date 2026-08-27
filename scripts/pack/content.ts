import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import {
  asPathList,
  findManifestPath,
  isRecord,
  sameRelPath,
  stripPath,
} from "./shared.ts";

/**
 * Cursor rule files use `.mdc` + attachment frontmatter (`alwaysApply`, `globs`).
 * Packed plugins ship plain `rules/*.md` — rename and drop those keys.
 */
export function normalizeRulesMdc(pluginDir: string): void {
  const rulesDir = join(pluginDir, "rules");

  if (!existsSync(rulesDir) || !statSync(rulesDir).isDirectory()) {
    return;
  }

  for (const name of readdirSync(rulesDir)) {
    if (!/\.mdc$/i.test(name)) {
      continue;
    }

    const from = join(rulesDir, name);

    if (!statSync(from).isFile()) {
      continue;
    }

    const toName = name.replace(/\.mdc$/i, ".md");
    const to = join(rulesDir, toName);

    if (existsSync(to)) {
      throw new Error(
        `${basename(pluginDir)}.rules: cannot normalize ${name} → ${toName} (exists)`,
      );
    }

    writeFileSync(to, stripCursorRuleMeta(readFileSync(from, "utf8")));
    rmSync(from, { force: true });
  }
}

/** Keep `description` + body; drop Cursor-only attachment keys. */
export function stripCursorRuleMeta(raw: string): string {
  const text = raw.replace(/^\uFEFF/, "");

  if (!text.startsWith("---")) {
    return raw;
  }

  const end = text.indexOf("\n---", 3);

  if (end < 0) {
    return raw;
  }

  const frontmatter = text
    .slice(3, end)
    .split("\n")
    .filter((line) => !/^\s*(alwaysApply|globs)\s*:/i.test(line))
    .join("\n");
  const body = text.slice(end + "\n---".length).replace(/^\r?\n/, "");

  if (!frontmatter.trim()) {
    return body;
  }

  return `---${frontmatter}\n---\n${body}`;
}

/**
 * Copy each source directory's entries into `canonical/` (plugin root), then
 * delete non-canonical sources. Collision on an existing dest name → error.
 */
export function remapDirsToCanonical(
  pluginDir: string,
  sources: string[],
  canonical: string,
  label: string,
): void {
  const dest = join(pluginDir, canonical);
  const seen = new Set<string>();

  for (const raw of sources) {
    const rel = stripPath(raw);

    if (seen.has(rel)) {
      continue;
    }

    seen.add(rel);

    const abs = join(pluginDir, rel);

    if (!existsSync(abs) || !statSync(abs).isDirectory()) {
      throw new Error(`${label}: missing directory ${raw}`);
    }

    if (sameRelPath(rel, canonical)) {
      continue;
    }

    mkdirSync(dest, { recursive: true });

    for (const name of readdirSync(abs)) {
      const from = join(abs, name);
      const to = join(dest, name);

      if (existsSync(to)) {
        throw new Error(
          `${label}: cannot remap ${rel}/${name} → ${canonical}/${name} (exists)`,
        );
      }

      cpSync(from, to, { recursive: true });
    }

    rmSync(abs, { recursive: true, force: true });
  }
}

function isMcpServerEntry(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }

  const url = typeof value.url === "string" ? value.url.trim() : "";
  const command =
    typeof value.command === "string" ? value.command.trim() : "";

  return url.length > 0 !== command.length > 0;
}

function renameLoneKey(
  servers: Record<string, unknown>,
  pluginName: string,
): { next: Record<string, unknown>; from: string } | undefined {
  const keys = Object.keys(servers);

  if (keys.length !== 1) {
    return undefined;
  }

  const from = keys[0];

  if (!from || from === pluginName) {
    return undefined;
  }

  return { next: { [pluginName]: servers[from] }, from };
}

/** One MCP server → marketplace plugin name. Vendor keys like `chatgpt_app_mcp` go away. */
export function renameLoneMcpServerKey(
  raw: unknown,
  pluginName: string,
): { next: Record<string, unknown>; from: string } | undefined {
  if (!isRecord(raw) || !pluginName) {
    return undefined;
  }

  if (isRecord(raw.mcpServers)) {
    const renamed = renameLoneKey(raw.mcpServers, pluginName);

    if (!renamed) {
      return undefined;
    }

    return { next: { ...raw, mcpServers: renamed.next }, from: renamed.from };
  }

  const values = Object.values(raw);

  if (values.length === 0 || !values.every(isMcpServerEntry)) {
    return undefined;
  }

  const renamed = renameLoneKey(raw, pluginName);

  if (!renamed) {
    return undefined;
  }

  return { next: renamed.next, from: renamed.from };
}

function mcpServerBag(raw: unknown): Record<string, unknown> | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }

  if (isRecord(raw.mcpServers)) {
    return raw.mcpServers;
  }

  const values = Object.values(raw);

  if (values.length === 0 || !values.every(isMcpServerEntry)) {
    return undefined;
  }

  return raw;
}

export function normalizePackedMcpServerId(pluginDir: string): void {
  const mcpJson = join(pluginDir, "mcp.json");

  if (!existsSync(mcpJson) || !statSync(mcpJson).isFile()) {
    return;
  }

  const pluginName = basename(pluginDir);
  const raw = JSON.parse(readFileSync(mcpJson, "utf8")) as unknown;
  const bag = mcpServerBag(raw);

  if (!bag) {
    return;
  }

  let servers = bag;
  const renamed = renameLoneKey(servers, pluginName);

  if (renamed) {
    servers = renamed.next;
    console.log(`  mcp ${renamed.from} → ${pluginName}`);
  }

  const next = { mcpServers: servers };
  const current = isRecord(raw) && isRecord(raw.mcpServers) ? raw : undefined;

  if (
    current &&
    JSON.stringify(current) === JSON.stringify(next)
  ) {
    return;
  }

  writeFileSync(mcpJson, `${JSON.stringify(next, null, 4)}\n`);
}

/**
 * Convention folders need no manifest paths — catalog + sandbox discover them.
 * Custom paths are remapped into the canonical root layout, then path fields
 * for skills / agents / mcpServers are stripped from the packed manifest.
 * Hooks / tools keep their packed paths (`./hooks/hooks.json`, `./tools.mjs`).
 */
export function normalizePluginContentPaths(pluginDir: string): void {
  const manifestPath = findManifestPath(pluginDir);
  const pluginName = basename(pluginDir);
  const json = manifestPath
    ? (JSON.parse(readFileSync(manifestPath, "utf8")) as unknown)
    : undefined;
  const record = isRecord(json) ? json : undefined;

  const skillPaths = record
    ? asPathList(record.skills, `${pluginName}.skills`)
    : undefined;

  if (skillPaths) {
    remapDirsToCanonical(pluginDir, skillPaths, "skills", `${pluginName}.skills`);
  }

  const agentPaths = record
    ? asPathList(record.agents, `${pluginName}.agents`)
    : undefined;

  if (agentPaths) {
    remapDirsToCanonical(pluginDir, agentPaths, "agents", `${pluginName}.agents`);
  }

  // Eve `instructions/` → canonical Cursor-style `rules/`.
  const instructionsDir = join(pluginDir, "instructions");
  if (
    existsSync(instructionsDir) &&
    statSync(instructionsDir).isDirectory()
  ) {
    remapDirsToCanonical(
      pluginDir,
      ["instructions"],
      "rules",
      `${pluginName}.instructions`,
    );
  }

  // Cursor project rules folder → `rules/`.
  const cursorRulesDir = join(pluginDir, ".cursor", "rules");
  if (
    existsSync(cursorRulesDir) &&
    statSync(cursorRulesDir).isDirectory()
  ) {
    remapDirsToCanonical(
      pluginDir,
      [".cursor/rules"],
      "rules",
      `${pluginName}.cursor.rules`,
    );
    const cursorDir = join(pluginDir, ".cursor");
    if (
      existsSync(cursorDir) &&
      readdirSync(cursorDir).length === 0
    ) {
      rmSync(cursorDir, { recursive: true, force: true });
    }
  }

  const rulePaths =
    record &&
    (typeof record.rules === "string" ||
      (Array.isArray(record.rules) &&
        record.rules.every((item) => typeof item === "string")))
      ? asPathList(record.rules, `${pluginName}.rules`)
      : undefined;

  if (rulePaths) {
    remapDirsToCanonical(pluginDir, rulePaths, "rules", `${pluginName}.rules`);
  }

  // Cursor `.mdc` → plain `.md` (packed catalog never ships `.mdc`).
  normalizeRulesMdc(pluginDir);

  // Accept either vendor name; packed output is always `mcp.json` (sandbox reads that).
  if (record && typeof record.mcpServers === "string" && record.mcpServers.trim()) {
    const rel = stripPath(record.mcpServers);
    const abs = join(pluginDir, rel);
    const dest = join(pluginDir, "mcp.json");

    if (!existsSync(abs) || !statSync(abs).isFile()) {
      throw new Error(`${pluginName}.mcpServers: missing file ${record.mcpServers}`);
    }

    if (!sameRelPath(rel, "mcp.json")) {
      if (existsSync(dest) && resolve(abs) !== resolve(dest)) {
        throw new Error(
          `${pluginName}.mcpServers: cannot remap ${rel} → mcp.json (exists)`,
        );
      }

      mkdirSync(dirname(dest), { recursive: true });
      cpSync(abs, dest);
      rmSync(abs, { force: true });
    }
  }

  const dotMcp = join(pluginDir, ".mcp.json");
  const mcpJson = join(pluginDir, "mcp.json");

  if (existsSync(dotMcp) && statSync(dotMcp).isFile()) {
    if (!existsSync(mcpJson)) {
      renameSync(dotMcp, mcpJson);
    } else if (resolve(dotMcp) !== resolve(mcpJson)) {
      // Convention file won; drop the dotted duplicate so the package is unambiguous.
      rmSync(dotMcp, { force: true });
    }
  }

  normalizePackedMcpServerId(pluginDir);

  if (record && typeof record.tools === "string" && record.tools.trim()) {
    const rel = stripPath(record.tools);

    // Source dir (not the packed barrel) → always land in `tools/` before bundle.
    if (!rel.endsWith(".mjs") && !sameRelPath(rel, "tools")) {
      remapDirsToCanonical(pluginDir, [rel], "tools", `${pluginName}.tools`);
    }
  }

  if (!manifestPath || !record) {
    return;
  }

  delete record.skills;
  delete record.agents;
  delete record.mcpServers;
  // Path strings only — catalog discovers `rules/` for offers.
  if (
    typeof record.rules === "string" ||
    (Array.isArray(record.rules) &&
      record.rules.every((item) => typeof item === "string"))
  ) {
    delete record.rules;
  }

  // Drop source-dir `tools` hints; `normalizePluginTools` rewrites `./tools.mjs`.
  if (
    typeof record.tools === "string" &&
    !stripPath(record.tools).endsWith(".mjs")
  ) {
    delete record.tools;
  }

  writeFileSync(manifestPath, `${JSON.stringify(record, null, 4)}\n`);
}

/** Parent shelf in marketplace.json stamps the packed manifest. */
export function stampPluginCategory(
  pluginDir: string,
  category: string,
): void {
  const manifestPath = findManifestPath(pluginDir);

  if (!manifestPath) {
    throw new Error(
      `${basename(pluginDir)}: cannot stamp category (no plugin.json)`,
    );
  }

  const raw = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;

  if (!isRecord(raw)) {
    throw new Error(`${basename(pluginDir)}: plugin.json must be an object`);
  }

  if (raw.category === category) {
    return;
  }

  raw.category = category;
  writeFileSync(manifestPath, `${JSON.stringify(raw, null, 4)}\n`);
}

