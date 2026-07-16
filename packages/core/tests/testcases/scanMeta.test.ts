import * as fs from "node:fs";

import { scanMeta } from "@/scanner/meta/scan";
import { testItems } from "../data";

describe("scanMeta", () => {
  const filePath = "test-meta.json";
  const key = "test-group";

  it("should parse a valid meta.json correctly", () => {
    const result = scanMeta(filePath, key);

    expect(result).toEqual({
      prefix: "test-prefix",
      items: testItems,
    });
  });

  it("should return key as prefix if not given in meta.json", () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify({ items: testItems }),
    );

    const result = scanMeta(filePath, key);

    expect(result).toEqual({
      prefix: "test-group",
      items: testItems,
    });
  });

  it("should throw an error for an invalid json file", () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue("asdf");

    expect(() => scanMeta(filePath, key)).toThrow(
      `[WonDocs] Failed to parse meta.json at "${filePath}"`,
    );
  });

  it("should throw an error for an invalid meta.json (fails WonDocs schema validation)", () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify({ prefix: "test-prefix", items: [{ type: "invalid" }] }),
    );

    expect(() => scanMeta(filePath, key)).toThrow(
      `[WonDocs] Invalid meta.json at "${filePath}"`,
    );
  });
});
