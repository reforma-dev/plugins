/**
 * Shared pack paths + tiny helpers.
 */
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** plugins/ repo root (this file lives in scripts/pack/). */
export const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
export const OUT = join(ROOT, "dist", "catalog");
export const TAR = join(ROOT, "dist", "catalog.tar.gz");

export const REFORMA_PLUGIN_DIR = ".reforma-plugin";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function pluginManifestPath(pluginDir: string): string {
  return join(pluginDir, REFORMA_PLUGIN_DIR, "plugin.json");
}

export function findManifestPath(pluginDir: string): string | undefined {
  const path = pluginManifestPath(pluginDir);

  return existsSync(path) ? path : undefined;
}

export function stripPath(value: string): string {
  const trimmed = value.trim();

  return trimmed.startsWith("./")
    ? trimmed.slice(2)
    : trimmed.replace(/^\/+/, "");
}

/** Compare plugin-relative paths ignoring `./` and trailing `/`. */
export function sameRelPath(left: string, right: string): boolean {
  const normalize = (value: string) =>
    stripPath(value).replace(/\/+$/, "").toLowerCase();

  return normalize(left) === normalize(right);
}

export type MarketplaceListing = {
  name: string;
  source: string;
  category: string;
  displayName?: string;
  description?: string;
  logo?: string;
  brandColor?: string;
};

/** Nested `categories[].plugins` → flat listings. Shelf is the parent category. */
export function parseMarketplace(raw: unknown): {
  categories: unknown;
  plugins: MarketplaceListing[];
  skipped: string[];
} {
  if (!isRecord(raw) || !Array.isArray(raw.categories)) {
    throw new Error("marketplace.json needs categories[]");
  }

  if (raw.plugins !== undefined) {
    throw new Error("marketplace.json plugins live under categories[].plugins");
  }

  const plugins: MarketplaceListing[] = [];
  const skipped: string[] = [];
  const categories: Array<Record<string, unknown>> = [];
  const names = new Set<string>();
  const categoryIds = new Set<string>();

  for (const [index, item] of raw.categories.entries()) {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      !item.id.trim() ||
      typeof item.name !== "string"
    ) {
      throw new Error(`marketplace.json categories[${index}] needs id and name`);
    }

    const id = item.id.trim();

    if (categoryIds.has(id)) {
      throw new Error(`marketplace.json has duplicate category id: ${id}`);
    }

    categoryIds.add(id);

    if (item.plugins === undefined) {
      categories.push({ id, name: item.name });
      continue;
    }

    if (!Array.isArray(item.plugins)) {
      throw new Error(`marketplace.json categories[${index}].plugins must be an array`);
    }

    const packed: Array<{ name: string; source: string }> = [];

    for (const [pluginIndex, plugin] of item.plugins.entries()) {
      if (
        !isRecord(plugin) ||
        typeof plugin.name !== "string" ||
        typeof plugin.source !== "string"
      ) {
        throw new Error(
          `marketplace.json categories[${index}].plugins[${pluginIndex}] needs name and source`,
        );
      }

      if (plugin.disabled !== undefined && plugin.disabled !== true) {
        throw new Error(
          `marketplace.json categories[${index}].plugins[${pluginIndex}] disabled must be true`,
        );
      }

      if (names.has(plugin.name)) {
        throw new Error(`Duplicate plugin name: ${plugin.name}`);
      }

      names.add(plugin.name);

      if (plugin.disabled === true) {
        skipped.push(plugin.name);
        continue;
      }

      packed.push({ name: plugin.name, source: plugin.source });
      plugins.push({
        name: plugin.name,
        source: plugin.source,
        category: id,
        ...optionalListingField(plugin, "displayName"),
        ...optionalListingField(plugin, "description"),
        ...optionalListingField(plugin, "logo"),
        ...optionalListingField(plugin, "brandColor"),
      });
    }

    categories.push(
      packed.length > 0 ? { id, name: item.name, plugins: packed } : { id, name: item.name },
    );
  }

  return { categories, plugins, skipped };
}

function optionalListingField(
  plugin: Record<string, unknown>,
  key: "displayName" | "description" | "logo" | "brandColor",
): Partial<Pick<MarketplaceListing, typeof key>> {
  const value = plugin[key];

  if (value === undefined) {
    return {};
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`marketplace.json plugin ${plugin.name} ${key} must be a string`);
  }

  return { [key]: value.trim() };
}

export function asPathList(raw: unknown, label: string): string[] | undefined {
  if (raw === undefined) {
    return undefined;
  }

  if (typeof raw === "string" && raw.trim()) {
    return [raw];
  }

  if (
    Array.isArray(raw) &&
    raw.length > 0 &&
    raw.every((item) => typeof item === "string" && item.trim())
  ) {
    return raw as string[];
  }

  throw new Error(`${label} must be a path string or path[]`);
}

