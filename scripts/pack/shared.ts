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

