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
import { foldMentionText, resolvePackedAgent, stampPackedAgent } from "./agent.ts";
import type { MarketplaceListing } from "./shared.ts";

function listing(
  overrides: Partial<MarketplaceListing> & Pick<MarketplaceListing, "name">,
): MarketplaceListing {
  return {
    source: "./marketplace/demo",
    category: "workspace",
    ...overrides,
  };
}

describe("foldMentionText", () => {
  it("folds case, hyphens, and punctuation", () => {
    expect(foldMentionText("Google-Drive!")).toBe("google drive");
    expect(foldMentionText("linear.app")).toBe("linear.app");
  });
});

describe("resolvePackedAgent", () => {
  it("defaults to folded id and displayName", () => {
    expect(
      resolvePackedAgent(
        { interface: { displayName: "GitHub" } },
        listing({ name: "github" }),
      ),
    ).toEqual({ mentions: ["github"] });
  });

  it("replaces defaults with an explicit mentions array", () => {
    expect(
      resolvePackedAgent(
        { agent: { mentions: ["linear.app"] } },
        listing({ name: "linear", displayName: "Linear" }),
      ),
    ).toEqual({ mentions: ["linear.app"] });
  });

  it("turns false or [] into no mentions", () => {
    expect(
      resolvePackedAgent({ agent: { mentions: false } }, listing({ name: "motion" })),
    ).toBeUndefined();
    expect(
      resolvePackedAgent({ agent: { mentions: [] } }, listing({ name: "motion" })),
    ).toBeUndefined();
  });

  it("listing.agent overlays plugin.json agent", () => {
    expect(
      resolvePackedAgent(
        { agent: { mentions: ["linear"], installApproval: false } },
        listing({
          name: "linear",
          agent: { mentions: ["linear.app"] },
        }),
      ),
    ).toEqual({ mentions: ["linear.app"], installApproval: false });
  });

  it("keeps installApproval false and drops discover", () => {
    expect(
      resolvePackedAgent(
        { agent: { discover: true, installApproval: false } },
        listing({ name: "coss", displayName: "coss" }),
      ),
    ).toEqual({ mentions: ["coss"], installApproval: false });
  });
});

describe("stampPackedAgent", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("writes resolved agent onto plugin.json", () => {
    const dir = mkdtempSync(join(tmpdir(), "agent-stamp-"));
    const pluginDir = join(dir, "neon");

    dirs.push(dir);
    mkdirSync(join(pluginDir, ".reforma-plugin"), { recursive: true });
    writeFileSync(
      join(pluginDir, ".reforma-plugin/plugin.json"),
      `${JSON.stringify({ name: "neon", agent: { mentions: ["neon.tech"] } }, null, 4)}\n`,
    );

    stampPackedAgent(pluginDir, listing({ name: "neon" }));

    expect(
      JSON.parse(readFileSync(join(pluginDir, ".reforma-plugin/plugin.json"), "utf8")),
    ).toEqual({
      name: "neon",
      agent: { mentions: ["neon.tech"] },
    });
  });
});
