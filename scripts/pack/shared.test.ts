import { describe, expect, it } from "bun:test";
import { parseMarketplace } from "./shared.ts";

describe("parseMarketplace", () => {
  it("skips disabled listings and strips them from packed categories", () => {
    const parsed = parseMarketplace({
      categories: [
        {
          id: "files",
          name: "Files",
          plugins: [
            { name: "keep", source: "./marketplace/files/keep" },
            {
              name: "dropbox",
              source: "./marketplace/files/dropbox",
              disabled: true,
            },
          ],
        },
      ],
    });

    expect(parsed.plugins.map((plugin) => plugin.name)).toEqual(["keep"]);
    expect(parsed.skipped).toEqual(["dropbox"]);
    expect(parsed.categories).toEqual([
      {
        id: "files",
        name: "Files",
        plugins: [{ name: "keep", source: "./marketplace/files/keep" }],
      },
    ]);
  });

  it("rejects disabled values other than true", () => {
    expect(() =>
      parseMarketplace({
        categories: [
          {
            id: "files",
            name: "Files",
            plugins: [
              {
                name: "dropbox",
                source: "./marketplace/files/dropbox",
                disabled: false,
              },
            ],
          },
        ],
      }),
    ).toThrow(/disabled must be true/);
  });
});
