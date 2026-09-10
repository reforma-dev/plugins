import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import { PORTABLE_MANIFEST_FIELDS } from "./extensions.ts";
import { ROOT, isRecord } from "./shared.ts";

function marketplaceSourceManifests(): string[] {
  const marketplace = join(ROOT, "marketplace");
  const out: string[] = [];

  for (const category of readdirSync(marketplace, { withFileTypes: true })) {
    if (!category.isDirectory() || category.name.startsWith("_")) {
      continue;
    }

    const categoryDir = join(marketplace, category.name);

    for (const plugin of readdirSync(categoryDir, { withFileTypes: true })) {
      if (!plugin.isDirectory()) {
        continue;
      }

      const manifest = join(categoryDir, plugin.name, "plugin.json");

      if (existsSync(manifest)) {
        out.push(manifest);
      }
    }
  }

  return out;
}

describe("marketplace plugin.json sources", () => {
  it("keep Reforma fields under extensions.reforma", () => {
    const manifests = marketplaceSourceManifests();

    expect(manifests.length).toBeGreaterThan(0);

    for (const path of manifests) {
      const json = JSON.parse(readFileSync(path, "utf8")) as unknown;

      expect(isRecord(json), path).toBe(true);

      if (!isRecord(json)) {
        continue;
      }

      for (const key of Object.keys(json)) {
        expect(PORTABLE_MANIFEST_FIELDS.has(key), `${path} top-level ${key}`).toBe(
          true,
        );
      }
    }
  });
});
