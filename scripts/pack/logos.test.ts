import { afterEach, describe, expect, it } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyCatalogOverlay } from "./logos.ts";

describe("applyCatalogOverlay", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("stamps displayName and description onto a remote pin", () => {
    const dir = mkdtempSync(join(tmpdir(), "overlay-"));
    const pluginDir = join(dir, "gsap");

    dirs.push(dir);
    mkdirSync(join(pluginDir, ".reforma-plugin"), { recursive: true });
    writeFileSync(
      join(pluginDir, ".reforma-plugin/plugin.json"),
      `${JSON.stringify(
        {
          name: "gsap-skills",
          description: "Official GSAP skills for Cursor",
        },
        null,
        4,
      )}\n`,
    );

    applyCatalogOverlay(pluginDir, {
      name: "gsap",
      source: "https://github.com/greensock/gsap-skills/tree/abc",
      category: "ui",
      displayName: "GSAP",
      description: "Animation timelines, ScrollTrigger, and GSAP plugins.",
    });

    expect(
      JSON.parse(
        readFileSync(join(pluginDir, ".reforma-plugin/plugin.json"), "utf8"),
      ),
    ).toMatchObject({
      name: "gsap-skills",
      description: "Animation timelines, ScrollTrigger, and GSAP plugins.",
      interface: { displayName: "GSAP" },
    });
  });

  it("stamps an http logo for pack to download", () => {
    const dir = mkdtempSync(join(tmpdir(), "overlay-"));
    const pluginDir = join(dir, "stripe");

    dirs.push(dir);
    mkdirSync(join(pluginDir, ".reforma-plugin"), { recursive: true });
    writeFileSync(
      join(pluginDir, ".reforma-plugin/plugin.json"),
      `${JSON.stringify({ name: "stripe" }, null, 4)}\n`,
    );

    applyCatalogOverlay(pluginDir, {
      name: "stripe",
      source: "https://github.com/stripe/ai/tree/abc",
      category: "payments",
      logo: "https://stripe.com/favicon.ico",
    });

    expect(
      JSON.parse(
        readFileSync(join(pluginDir, ".reforma-plugin/plugin.json"), "utf8"),
      ),
    ).toMatchObject({
      logo: "https://stripe.com/favicon.ico",
      interface: { logo: "https://stripe.com/favicon.ico" },
    });
  });

  it("stamps logoSmall from the listing", () => {
    const dir = mkdtempSync(join(tmpdir(), "overlay-"));
    const pluginDir = join(dir, "gsap");

    dirs.push(dir);
    mkdirSync(join(pluginDir, ".reforma-plugin"), { recursive: true });
    writeFileSync(
      join(pluginDir, ".reforma-plugin/plugin.json"),
      `${JSON.stringify({ name: "gsap-skills" }, null, 4)}\n`,
    );

    applyCatalogOverlay(pluginDir, {
      name: "gsap",
      source: "https://github.com/greensock/gsap-skills/tree/abc",
      category: "ui",
      logoSmall: "https://example.com/gsap-small.svg",
    });

    expect(
      JSON.parse(
        readFileSync(join(pluginDir, ".reforma-plugin/plugin.json"), "utf8"),
      ),
    ).toMatchObject({
      logoSmall: "https://example.com/gsap-small.svg",
      interface: { logoSmall: "https://example.com/gsap-small.svg" },
    });
  });
});
