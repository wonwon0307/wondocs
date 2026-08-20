/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "node:fs";

import { detectCollections } from "@/collection/build";

vi.unmock("@/collection/build");

describe("detectCollections", () => {
  const contentsDir = "/path/to/contents";

  beforeEach(() => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
  });

  it("detects single-group mode correctly", () => {
    const result = detectCollections(contentsDir);
    expect(result).toEqual([{ key: "", path: contentsDir }]);
  });

  it("detects multi-group mode correctly", () => {
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);

    const result = detectCollections(contentsDir);
    expect(result).toEqual([
      { key: "group1", path: "/path/to/contents/group1" },
      { key: "group2", path: "/path/to/contents/group2" },
    ]);
  });

  it("throws an error if files are in the root of the contents directory in multi-group mode", () => {
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);
    vi.spyOn(fs, "readdirSync").mockReturnValueOnce([
      { name: "file1.md", isDirectory: () => false, isFile: () => true },
    ] as any);

    expect(() => detectCollections(contentsDir)).toThrow(
      `[WonDocs] contentsDir "${contentsDir}" contains files at its root but no meta.json`,
    );
  });

  it("throws an error if there are no directories in the contents directory in multi-group mode", () => {
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);
    vi.spyOn(fs, "readdirSync").mockReturnValueOnce([]);

    expect(() => detectCollections(contentsDir)).toThrow(
      `[WonDocs] contentsDir "${contentsDir}" is empty. Add a meta.json (single-group) or subdirectories with meta.json files (multi-group).`,
    );
  });

  it("throws an error if a subdirectory is missing a meta.json in multi-group mode", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    vi.spyOn(fs, "readdirSync").mockReturnValueOnce([
      { name: "group1", isDirectory: () => true, isFile: () => false },
      { name: "group2", isDirectory: () => true, isFile: () => false },
    ] as any);

    expect(() => detectCollections(contentsDir)).toThrow(
      `[WonDocs] The following group directories are missing a meta.json: "group1", "group2"`,
    );
  });
});
