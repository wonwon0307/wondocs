import * as fsPromises from "node:fs/promises";

import { scanMeta } from "@/meta/scan";
import { testItems, expectedReturnItems, expectedReturnHrefs } from "../data";

describe("scanMeta", () => {
  const filePath = "test-meta.json";
  const key = "test-collection";

  it("should parse a valid meta.json correctly", async () => {
    vi.spyOn(fsPromises, "readFile").mockResolvedValue(
      JSON.stringify({ items: testItems }),
    );

    const result = await scanMeta(filePath, key);

    expect(result.items).toEqual(expectedReturnItems);
    expect(result.hrefs).toEqual(expectedReturnHrefs);
  });

  it("should return key as prefix if not given in meta.json", async () => {
    vi.spyOn(fsPromises, "readFile").mockResolvedValue(
      JSON.stringify({ items: testItems }),
    );

    const result = await scanMeta(filePath, key);

    expect(result.items).toEqual(expectedReturnItems);
  });

  it("should parse a deeply nested group structure correctly", async () => {
    const nested = {
      items: [
        {
          type: "group",
          label: "Outer",
          items: [
            {
              type: "group",
              label: "Inner",
              items: [{ type: "link", href: "/deep" }],
            },
          ],
        },
      ],
    };
    vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(nested));

    const result = await scanMeta(filePath, key);

    expect(result.items).toEqual([
      {
        type: "group",
        label: "Outer",
        items: [
          {
            type: "group",
            label: "Inner",
            items: [{ type: "link", href: "test-collection/deep" }],
          },
        ],
      },
    ]);
  });

  it("should include the nested path in the error message for a mid-tree validation failure", async () => {
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

  it("should throw an error for an invalid json file", async () => {
    vi.spyOn(fsPromises, "readFile").mockResolvedValue("asdf");

    await expect(scanMeta(filePath, key)).rejects.toThrow(
      `[WonDocs] Failed to parse meta.json at "${filePath}"`,
    );
  });

  it("should throw an error for an invalid meta.json (fails WonDocs schema validation)", async () => {
    vi.spyOn(fsPromises, "readFile").mockResolvedValue(
      JSON.stringify({ prefix: "test-prefix", items: [{ type: "invalid" }] }),
    );

    await expect(scanMeta(filePath, key)).rejects.toThrow(
      `[WonDocs] Invalid meta.json at "${filePath}"`,
    );
  });
});
