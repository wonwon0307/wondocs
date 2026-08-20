/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "node:fs";

import { scaffoldSampleDocs } from "@/collection/scaffold";
import * as files from "@/utils/files";

vi.unmock("@/collection/scaffold");

describe("scaffoldSampleDocs", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  it("should scaffold sample docs when contentsDir is empty", async () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue([]);

    const contentsDir = "/path/to/empty/contents";
    const result = await scaffoldSampleDocs(contentsDir);

    expect(result).toBe(true);
    expect(files.atomicWrite).toHaveBeenCalledWith(
      `${contentsDir}/meta.json`,
      expect.stringContaining('"href": "/getting-started"'),
    );
    expect(files.atomicWrite).toHaveBeenCalledWith(
      `${contentsDir}/getting-started.mdx`,
      expect.stringContaining("# Getting Started with WonDocs"),
    );
  });

  it("should not scaffold sample docs when contentsDir is not empty", async () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue(["existing-file.txt" as any]);

    const contentsDir = "/path/to/non-empty/contents";
    const result = await scaffoldSampleDocs(contentsDir);

    expect(result).toBe(false);
    expect(files.atomicWrite).not.toHaveBeenCalled();
  });
});
