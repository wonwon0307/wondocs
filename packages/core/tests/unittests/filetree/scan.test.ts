/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "node:fs/promises";

import { scanFileTree } from "@/filetree/scan";

vi.unmock("@/filetree/scan");

function createTestDirent(
  name: string,
  parentPath: string,
  type: "file" | "directory" = "file",
) {
  return {
    name,
    parentPath,
    isFile: () => type === "file",
    isDirectory: () => type === "directory",
  };
}

describe("scanFileTree", () => {
  const testDir = "./testDir";

  it("returns an empty tree for an empty directory", async () => {
    vi.spyOn(fs, "readdir").mockResolvedValueOnce([]);
    const result = await scanFileTree(testDir, "");
    expect(result.tree).toEqual({});
    expect(result.hrefs).toEqual(new Set());
  });

  it("collects .md and .mdx files and derives slugs correctly", async () => {
    vi.spyOn(fs, "readdir").mockResolvedValueOnce([
      createTestDirent("file1.md", testDir),
      createTestDirent("file2.mdx", testDir),
      createTestDirent("subdir", testDir, "directory"),
    ] as any);

    const result = await scanFileTree(testDir, "");
    expect(result.tree).toEqual({
      file1: "testDir/file1.md",
      file2: "testDir/file2.mdx",
    });
    expect(result.hrefs).toEqual(new Set(["/file1", "/file2"]));
  });

  it("prepends a non-empty prefix, separated by a slash", async () => {
    vi.spyOn(fs, "readdir").mockResolvedValueOnce([
      createTestDirent("installation.md", testDir),
    ] as any);

    const result = await scanFileTree(testDir, "guides");
    expect(result.tree).toEqual({
      installation: "testDir/installation.md",
    });
    expect(result.hrefs).toEqual(new Set(["guides/installation"]));
  });

  it("derives slugs for nested files correctly", async () => {
    vi.spyOn(fs, "readdir").mockResolvedValueOnce([
      createTestDirent("nested/file3.md", testDir),
    ] as any);

    const result = await scanFileTree(testDir, "");
    expect(result.tree).toEqual({
      "nested/file3": "testDir/nested/file3.md",
    });
    expect(result.hrefs).toEqual(new Set(["/nested/file3"]));
  });

  it("handles index files correctly", async () => {
    vi.spyOn(fs, "readdir").mockResolvedValueOnce([
      createTestDirent("subdir/index.mdx", testDir),
    ] as any);

    const result = await scanFileTree(testDir, "");
    expect(result.tree).toEqual({
      subdir: "testDir/subdir/index.mdx",
    });
    expect(result.hrefs).toEqual(new Set(["/subdir"]));
  });

  it("skips meta.json files and directories", async () => {
    vi.spyOn(fs, "readdir").mockResolvedValueOnce([
      createTestDirent("meta.json", testDir),
      createTestDirent("subdir", testDir, "directory"),
    ] as any);

    const result = await scanFileTree(testDir, "");
    expect(result.tree).toEqual({});
    expect(result.hrefs).toEqual(new Set());
  });

  it("throws an error for hidden file", async () => {
    vi.spyOn(fs, "readdir").mockResolvedValueOnce([
      createTestDirent(".hiddenfile.md", testDir),
    ] as any);

    await expect(scanFileTree(testDir, "")).rejects.toThrow(
      '[WonDocs] Hidden files or directories are not allowed: ".hiddenfile.md"',
    );
  });

  it("throws an error for hidden directory", async () => {
    vi.spyOn(fs, "readdir").mockResolvedValueOnce([
      createTestDirent(".hiddendir", testDir, "directory"),
    ] as any);

    await expect(scanFileTree(testDir, "")).rejects.toThrow(
      '[WonDocs] Hidden files or directories are not allowed: ".hiddendir"',
    );
  });

  it("throws an error for files inside hidden directory", async () => {
    vi.spyOn(fs, "readdir").mockResolvedValueOnce([
      createTestDirent(".hiddendir/file.md", testDir, "file"),
    ] as any);

    await expect(scanFileTree(testDir, "")).rejects.toThrow(
      '[WonDocs] Hidden files or directories are not allowed: ".hiddendir/file.md"',
    );
  });

  it("throws an error for unsupported file types", async () => {
    vi.spyOn(fs, "readdir").mockResolvedValueOnce([
      createTestDirent("file.txt", testDir),
    ] as any);

    await expect(scanFileTree(testDir, "")).rejects.toThrow(
      '[WonDocs] Only .md or .mdx files are allowed: "file.txt"',
    );
  });
});
