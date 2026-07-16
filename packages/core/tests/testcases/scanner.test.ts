/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";

import { Scanner } from "@/scanner";

vi.mock("@/scanner/meta/scan", () => ({
  scanMeta: vi.fn().mockReturnValue({
    prefix: "test-prefix",
    items: [
      {
        type: "link",
        label: "Test Leaf",
        url: "/test-leaf",
        slug: "test-leaf",
      },
    ],
  }),
}));

describe("Scanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const config = {
    contentsDir: "test-contents",
    baseUrl: "/",
  };

  it("scans a single-group structure correctly", async () => {
    const scanner = new Scanner(config);
    await scanner.scan();

    expect(fsPromises.writeFile).toHaveBeenCalledOnce();
  });

  it("scans a multi-group structure correctly", async () => {
    // 첫번째 existsSync가 false를 반환하도록 모킹하여 multi-group 구조를 시뮬레이션
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);
    const scanner = new Scanner(config);
    await scanner.scan();

    expect(fsPromises.writeFile).toHaveBeenCalledOnce();
  });

  it("handles errors during atomic write", async () => {
    vi.spyOn(fsPromises, "writeFile").mockRejectedValueOnce(
      new Error("Disk full"),
    );

    const scanner = new Scanner(config);
    await expect(scanner.scan()).rejects.toThrow(`Error writing file `);
  });

  it("handles unknown atomic write error gracefully", async () => {
    vi.spyOn(fsPromises, "writeFile").mockRejectedValueOnce("Unknown error");

    const scanner = new Scanner(config);
    await expect(scanner.scan()).rejects.toThrow(`Error writing file `);
  });

  it("throws an error for invalid file in contentsDir", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);
    vi.spyOn(fs, "readdirSync").mockReturnValueOnce([
      { name: "file.txt", isDirectory: () => false, isFile: () => true },
    ] as any);

    const scanner = new Scanner(config);
    await expect(scanner.scan()).rejects.toThrow(
      `[WonDocs] contentsDir "test-contents" contains files at its root but no meta.json — either add a meta.json for single-group mode, or remove root-level files for multi-group mode.`,
    );
  });

  it("throws an error no meta.json in DocsGroup", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    const scanner = new Scanner(config);
    await expect(scanner.scan()).rejects.toThrow(
      `[WonDocs] The following group directories are missing a meta.json: `,
    );
  });

  it("throws an error for empty contentsDir", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);
    vi.spyOn(fs, "readdirSync").mockReturnValueOnce([]);

    const scanner = new Scanner(config);
    await expect(scanner.scan()).rejects.toThrow(
      `[WonDocs] contentsDir "test-contents" is empty. Add a meta.json (single-group) or subdirectories with meta.json files (multi-group).`,
    );
  });
});
