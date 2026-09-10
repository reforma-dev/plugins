import { describe, expect, it } from "bun:test";
import {
  foldReformaExtension,
  PLUGIN_SCHEMA,
  unfoldReformaExtension,
} from "./extensions.ts";

describe("foldReformaExtension", () => {
  it("scoops Cursor/Reforma fields into extensions.reforma", () => {
    const json: Record<string, unknown> = {
      name: "google-drive",
      description: "Docs in Drive",
      author: { name: "Reforma" },
      logo: "assets/logo.svg",
      interface: { displayName: "Google Drive" },
      agent: { mentions: ["drive.google.com"] },
      category: "files",
    };

    foldReformaExtension(json);

    expect(json).toEqual({
      $schema: PLUGIN_SCHEMA,
      name: "google-drive",
      description: "Docs in Drive",
      author: { name: "Reforma" },
      extensions: {
        reforma: {
          logo: "assets/logo.svg",
          interface: { displayName: "Google Drive" },
          agent: { mentions: ["drive.google.com"] },
          category: "files",
        },
      },
    });
  });

  it("keeps other extension namespaces", () => {
    const json: Record<string, unknown> = {
      name: "plug",
      hooks: "./hooks/hooks.json",
      extensions: { "com.cursor": { setting: true } },
    };

    foldReformaExtension(json);

    expect(json.extensions).toEqual({
      "com.cursor": { setting: true },
      reforma: { hooks: "./hooks/hooks.json" },
    });
  });
});

describe("unfoldReformaExtension", () => {
  it("hoists the bag so pack can stamp top-level fields", () => {
    const json: Record<string, unknown> = {
      name: "plug",
      extensions: {
        reforma: { interface: { displayName: "Plug" }, category: "demo" },
        "com.cursor": { setting: true },
      },
    };

    unfoldReformaExtension(json);

    expect(json).toEqual({
      name: "plug",
      interface: { displayName: "Plug" },
      category: "demo",
      extensions: { "com.cursor": { setting: true } },
    });
  });

  it("lets top-level vendor fields win over the bag", () => {
    const json: Record<string, unknown> = {
      name: "plug",
      logo: "assets/vendor.svg",
      extensions: { reforma: { logo: "assets/old.svg", category: "demo" } },
    };

    unfoldReformaExtension(json);

    expect(json.logo).toBe("assets/vendor.svg");
    expect(json.category).toBe("demo");
  });
});
