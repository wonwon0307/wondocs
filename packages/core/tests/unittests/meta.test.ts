import * as fsPromises from "node:fs/promises";
import * as sidebar from "#wondocs/sidebar";

import { getSidebar } from "@/meta/api";
import { scanMeta } from "@/meta/scan";
import { testItems, expectedReturnItems, expectedReturnLinks } from "../data";

vi.unmock("@/meta/scan");

describe("scanMeta", () => {
  const filePath = "test-meta.json";
  const key = "test-collection";

  it("should parse a valid meta.json correctly", async () => {
    vi.spyOn(fsPromises, "readFile").mockResolvedValue(
      JSON.stringify({ items: testItems }),
    );

    const result = await scanMeta(filePath, key);

    // return key as prefix if not given in meta.json
    expect(result.prefix).toEqual(key);
    expect(result.items).toEqual(expectedReturnItems);
    expect(result.links).toEqual(expectedReturnLinks);
  });

  it("should handle custom prefix correctly", async () => {
    const customPrefix = "custom-prefix";
    vi.spyOn(fsPromises, "readFile").mockResolvedValue(
      JSON.stringify({
        prefix: customPrefix,
        items: [
          {
            type: "link",
            label: "Test Link",
            href: "/test-link",
          },
        ],
      }),
    );

    const result = await scanMeta(filePath, key);

    // return key as prefix if not given in meta.json
    expect(result.prefix).toEqual(customPrefix);
    expect(result.items).toEqual([
      {
        type: "link",
        label: "Test Link",
        href: `${customPrefix}/test-link`,
      },
    ]);
    expect(result.links).toEqual([
      { href: `${customPrefix}/test-link`, external: false, disabled: false },
    ]);
  });

  it("should mark disabled links in the returned links", async () => {
    vi.spyOn(fsPromises, "readFile").mockResolvedValue(
      JSON.stringify({
        items: [
          {
            type: "link",
            label: "Coming Soon",
            href: "/coming-soon",
            disabled: true,
          },
        ],
      }),
    );

    const result = await scanMeta(filePath, key);

    expect(result.links).toEqual([
      {
        href: `${key}/coming-soon`,
        external: false,
        disabled: true,
      },
    ]);
  });

  it("should throw an error for a duplicate href", async () => {
    vi.spyOn(fsPromises, "readFile").mockResolvedValue(
      JSON.stringify({
        items: [
          { type: "link", href: "/duplicate" },
          {
            type: "group",
            label: "Nested",
            items: [{ type: "link", href: "/duplicate" }],
          },
        ],
      }),
    );

    await expect(scanMeta(filePath, key)).rejects.toThrow(
      `[WonDocs] Duplicate href "${key}/duplicate" in meta.json at "${filePath}"`,
    );
  });

  it("should throw an error for an invalid json file", async () => {
    vi.spyOn(fsPromises, "readFile").mockResolvedValue("asdf");

    await expect(scanMeta(filePath, key)).rejects.toThrow(
      `[WonDocs] Failed to parse meta.json at "${filePath}"`,
    );
  });

  it("should format the error for schema validation failure (root)", async () => {
    vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify([]));

    await expect(scanMeta(filePath, key)).rejects.toThrow("(root):");
  });

  it("should throw an error for schema validation failure (nested path in tree)", async () => {
    const invalid = {
      items: [
        {
          type: "group",
          label: "Outer",
          items: [{ type: "invalid" }],
        },
      ],
    };
    vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(invalid));

    await expect(scanMeta(filePath, key)).rejects.toThrow("items[0].items[0]");
  });
});

describe("getSidebar", () => {
  beforeEach(() => {
    vi.spyOn(sidebar, "default", "get").mockReturnValue({
      group1: { items: [] },
      group2: { items: [] },
    });
  });

  it("should return the group for a valid key", () => {
    const group = getSidebar("group1");
    expect(group).toEqual({ items: [] });
  });

  it("should return the single group if no parameter is provided", () => {
    vi.spyOn(sidebar, "default", "get").mockReturnValueOnce({
      "": { items: [] },
    });

    const group = getSidebar();
    expect(group).toEqual({ items: [] });
  });

  it("should throw if no parameter is provided and no single group exists", () => {
    expect(() => getSidebar()).toThrow(
      "[WonDocs] No single group found. Available groups: group1, group2",
    );
  });

  it("should throw if a non-existent key is provided", () => {
    expect(() => getSidebar("nonExistentGroup")).toThrow(
      '[WonDocs] No group found for key "nonExistentGroup". Available groups: group1, group2',
    );
  });
});
