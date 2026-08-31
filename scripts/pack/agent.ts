/**
 * Resolve `plugin.json` `agent` at pack time: mentions defaults + fold,
 * strip `discover`. Runtime only matches the packed array.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { findManifestPath, isRecord, type MarketplaceListing } from "./shared.ts";

/** Lowercase, hyphen → space, drop other punctuation except `.`. */
export function foldMentionText(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("-", " ")
    .replace(/[^\p{L}\p{N}.]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueFolded(values: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const folded = foldMentionText(value);

    if (!folded || seen.has(folded)) {
      continue;
    }

    seen.add(folded);
    out.push(folded);
  }

  return out;
}

function displayNameForDefaults(
  json: Record<string, unknown>,
  listing: MarketplaceListing,
): string {
  const iface = isRecord(json.interface) ? json.interface : undefined;
  const fromInterface =
    typeof iface?.displayName === "string" ? iface.displayName.trim() : "";

  if (fromInterface) {
    return fromInterface;
  }

  return listing.displayName?.trim() || listing.name;
}

function readMentionsField(raw: unknown, label: string): string[] | false | undefined {
  if (raw === undefined) {
    return undefined;
  }

  if (raw === false) {
    return false;
  }

  if (!Array.isArray(raw) || raw.some((item) => typeof item !== "string")) {
    throw new Error(`${label} must be a string[] or false`);
  }

  return raw;
}

function mergeAgent(
  json: Record<string, unknown>,
  listing: MarketplaceListing,
): Record<string, unknown> {
  const base = isRecord(json.agent) ? { ...json.agent } : {};

  if (listing.agent) {
    Object.assign(base, listing.agent);
  }

  return base;
}

/** Packed `agent`: folded mentions (omit when empty) + `installApproval: false`. */
export function resolvePackedAgent(
  json: Record<string, unknown>,
  listing: MarketplaceListing,
): Record<string, unknown> | undefined {
  const merged = mergeAgent(json, listing);
  const mentionsRaw = readMentionsField(
    merged.mentions,
    `${listing.name} agent.mentions`,
  );
  const mentions =
    mentionsRaw === false || Array.isArray(mentionsRaw)
      ? uniqueFolded(mentionsRaw === false ? [] : mentionsRaw)
      : uniqueFolded([listing.name, displayNameForDefaults(json, listing)]);

  const installApproval = merged.installApproval;
  const agent: Record<string, unknown> = {
    ...(mentions.length > 0 ? { mentions } : {}),
    ...(installApproval === false ? { installApproval: false } : {}),
  };

  return Object.keys(agent).length > 0 ? agent : undefined;
}

/** Last pack stamp so overlay / category writes cannot skip mentions. */
export function stampPackedAgent(
  pluginDir: string,
  listing: MarketplaceListing,
): void {
  const manifestPath = findManifestPath(pluginDir);

  if (!manifestPath) {
    throw new Error(`no plugin.json in ${pluginDir}`);
  }

  const json = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;

  if (!isRecord(json)) {
    throw new Error(`invalid plugin.json ${manifestPath}`);
  }

  const agent = resolvePackedAgent(json, listing);

  if (agent) {
    json.agent = agent;
  }
  else {
    delete json.agent;
  }

  writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
}
