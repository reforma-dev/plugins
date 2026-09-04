import { describe, expect, it } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  publishCatalogLogos,
  type LogoObjectStore,
} from "./publish-logos.ts";

const LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg"/>';
const CDN = /^https:\/\/cdn\.example\/plugins\/[a-f0-9]{64}\.svg$/;

function writePackedPlugin(dir: string, name: string, logo = "assets/logo.svg"): void {
  writeFileSync(
    join(dir, "marketplace.json"),
    `${JSON.stringify({
      categories: [
        {
          id: "demo",
          name: "Demo",
          plugins: [{ name, source: `./${name}` }],
        },
      ],
    })}\n`,
  );

  const pluginDir = join(dir, name);

  mkdirSync(join(pluginDir, ".reforma-plugin"), { recursive: true });
  mkdirSync(join(pluginDir, "assets"), { recursive: true });
  writeFileSync(
    join(pluginDir, ".reforma-plugin/plugin.json"),
    `${JSON.stringify({ name, logo }, null, 4)}\n`,
  );
  writeFileSync(join(pluginDir, "assets/logo.svg"), LOGO_SVG);
}

function memoryStore(): LogoObjectStore {
  const objects = new Map<string, Buffer>();

  return {
    exists: async (key) => objects.has(key),
    put: async (key, body) => {
      objects.set(key, body);
    },
  };
}

describe("publishCatalogLogos", () => {
  it("stamps a content-hash CDN url and uploads once", async () => {
    const dir = mkdtempSync(join(tmpdir(), "catalog-logos-"));

    writePackedPlugin(dir, "demo-hooks");

    const store = memoryStore();
    const first = await publishCatalogLogos(dir, {
      store,
      publicEndpoint: "https://cdn.example",
    });
    const stamped = JSON.parse(
      readFileSync(join(dir, "demo-hooks/.reforma-plugin/plugin.json"), "utf8"),
    ).logo as string;

    expect(first).toEqual({ uploaded: 1, cached: 0 });
    expect(stamped).toMatch(CDN);

    writeFileSync(
      join(dir, "demo-hooks/.reforma-plugin/plugin.json"),
      `${JSON.stringify({ name: "demo-hooks", logo: "assets/logo.svg" }, null, 4)}\n`,
    );

    const second = await publishCatalogLogos(dir, {
      store,
      publicEndpoint: "https://cdn.example",
    });

    expect(second).toEqual({ uploaded: 0, cached: 1 });
    expect(
      JSON.parse(
        readFileSync(join(dir, "demo-hooks/.reforma-plugin/plugin.json"), "utf8"),
      ).logo,
    ).toBe(stamped);
  });

  it("leaves an already-public https logo untouched", async () => {
    const dir = mkdtempSync(join(tmpdir(), "catalog-logos-"));
    const cdn = "https://cdn.example/plugins/already.svg";

    writePackedPlugin(dir, "stripe", cdn);

    const store = memoryStore();
    const result = await publishCatalogLogos(dir, {
      store,
      publicEndpoint: "https://cdn.example",
    });

    expect(result).toEqual({ uploaded: 0, cached: 0 });
    expect(
      JSON.parse(
        readFileSync(join(dir, "stripe/.reforma-plugin/plugin.json"), "utf8"),
      ).logo,
    ).toBe(cdn);
  });
});
