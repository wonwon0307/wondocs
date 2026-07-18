/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";

import { buildDocs } from "@/build";

vi.mock("@/meta/scan", () => ({
  scanMeta: vi.fn().mockResolvedValue({
    items: [
      {
        type: "link",
        label: "Test Leaf",
        url: "/test-leaf",
        slug: "test-leaf",
      },
    ],
    hrefs: new Set(["/test-leaf"]),
  }),
}));

describe("Scanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const config = {
    root: "/test-root",
    contentsDir: "test-contents",
    baseUrl: "/",
  };

  it("scans a single-group structure correctly", async () => {
    await buildDocs(config);

    expect(fsPromises.writeFile).toHaveBeenCalledOnce();
  });

  it("scans a multi-group structure correctly", async () => {
    // 첫번째 existsSync가 false를 반환하도록 모킹하여 multi-group 구조를 시뮬레이션
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);
    await buildDocs(config);

    expect(fsPromises.writeFile).toHaveBeenCalledOnce();
  });

  it("handles errors during atomic write", async () => {
    vi.spyOn(fsPromises, "writeFile").mockRejectedValueOnce(
      new Error("Disk full"),
    );

    await expect(buildDocs(config)).rejects.toThrow(`Error writing file `);
  });

  it("handles unknown atomic write error gracefully", async () => {
    vi.spyOn(fsPromises, "writeFile").mockRejectedValueOnce("Unknown error");

    await expect(buildDocs(config)).rejects.toThrow(`Error writing file `);
  });

  it("throws an error for invalid file in contentsDir", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);
    vi.spyOn(fs, "readdirSync").mockReturnValueOnce([
      { name: "file.txt", isDirectory: () => false, isFile: () => true },
    ] as any);

    await expect(buildDocs(config)).rejects.toThrow(
      `[WonDocs] contentsDir "test-contents" contains files at its root but no meta.json — either add a meta.json for single-group mode, or remove root-level files for multi-group mode.`,
    );
  });

  it("throws an error no meta.json in DocsGroup", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    await expect(buildDocs(config)).rejects.toThrow(
      `[WonDocs] The following group directories are missing a meta.json: `,
    );
  });

  it("throws an error for empty contentsDir", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);
    vi.spyOn(fs, "readdirSync").mockReturnValueOnce([]);

    await expect(buildDocs(config)).rejects.toThrow(
      `[WonDocs] contentsDir "test-contents" is empty. Add a meta.json (single-group) or subdirectories with meta.json files (multi-group).`,
    );
  });
});
