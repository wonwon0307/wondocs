import * as fs from "fs/promises";

import { buildDocs } from "@/build";
import { detectCollections } from "@/collection/build";
import { scanMeta } from "@/meta/scan";
import { scanFileTree } from "@/filetree/scan";
import { buildPages } from "@/filetree/build";
import { atomicWrite } from "@/utils/files";

describe("buildDocs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const config = {
    root: "/test-root",
    contentsDir: "test-contents",
    baseUrl: "/",
  };

  // everything is mocked, so only test if functions are called
  it("should call functions correctly", async () => {
    await buildDocs(config);

    // 1. detect collections
    expect(detectCollections).toHaveBeenCalledWith("test-contents");

    // 2. scan
    expect(scanMeta).toHaveBeenCalledWith(
      "/path/to/group1/meta.json",
      "group1",
    );
    expect(scanMeta).toHaveBeenCalledWith(
      "/path/to/group2/meta.json",
      "group2",
    );
    expect(scanFileTree).toHaveBeenCalledWith("/path/to/group1", "test-prefix");
    expect(scanFileTree).toHaveBeenCalledWith("/path/to/group2", "test-prefix");

    // 3. build pages
    expect(buildPages).toHaveBeenCalledWith(
      {
        "test-group/test-child-leaf": "/path/to/test-group/test-child-leaf.md",
        "test-leaf": "/path/to/test-leaf.md",
      },
      "/test-root/.wondocs",
    );

    // 4. write files
    expect(atomicWrite).toHaveBeenCalledWith(
      "/test-root/.wondocs/sidebar.js",
      expect.stringContaining('"group1"'),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      "/test-root/.wondocs/pages.js",
      expect.stringContaining('"test-leaf"'),
    );

    // mocked fs access doesn't throw, so .gitignore should not be written
    expect(atomicWrite).not.toHaveBeenCalledWith(
      "/test-root/.wondocs/.gitignore",
      "*\n",
    );
  });

  it("should write .gitignore if it does not exist", async () => {
    vi.spyOn(fs, "access").mockRejectedValueOnce(new Error("File not found"));

    await buildDocs(config);

    // mocked fs access throws, so .gitignore should be written
    expect(atomicWrite).toHaveBeenCalledWith(
      "/test-root/.wondocs/.gitignore",
      "*\n",
    );
  });
});
