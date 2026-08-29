/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "node:fs";

import { builderContext } from "@/context";
import * as files from "@/lib/files";
import type { ResolvedConfig } from "@/managers/types";
import { Pages } from "@/models/pages/models";

describe("Pages", () => {
  vi.spyOn(builderContext.config, "getConfig").mockReturnValue({
    outDir: "/path/to/out/dir",
    mdx: {},
  } as ResolvedConfig);
  vi.spyOn(fs, "readdirSync").mockReturnValue([
    {
      name: "test-page.mdx",
      isFile: () => true,
      isDirectory: () => false,
      parentPath: "/path/to/collection/pages",
    },
    {
      name: "subdirectory",
      isFile: () => false,
      isDirectory: () => true,
      parentPath: "/path/to/collection/pages",
    },
    {
      name: "index.mdx",
      isFile: () => true,
      isDirectory: () => false,
      parentPath: "/path/to/collection/pages/subdirectory",
    },
    {
      name: "test-child-page.mdx",
      isFile: () => true,
      isDirectory: () => false,
      parentPath: "/path/to/collection/pages/subdirectory",
    },
  ] as any);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should scan and compile pages correctly", async () => {
    const pages = new Pages("/path/to/collection");

    pages.scan("collection");

    await pages.compilePages();

    expect(files.atomicWrite).toHaveBeenCalledTimes(3);
    expect(builderContext.urls.inspectPagesUrl).toHaveBeenCalledWith(
      "/collection/test-page",
    );
    expect(builderContext.urls.inspectPagesUrl).toHaveBeenCalledWith(
      "/collection/subdirectory",
    );
    expect(builderContext.urls.inspectPagesUrl).toHaveBeenCalledWith(
      "/collection/subdirectory/test-child-page",
    );
  });

  it("should handle root contentsDir (empty baseUrl) correctly", async () => {
    const pages = new Pages("/path/to/collection");

    pages.scan("");

    await pages.compilePages();

    expect(files.atomicWrite).toHaveBeenCalledTimes(3);
    expect(builderContext.urls.inspectPagesUrl).toHaveBeenCalledWith(
      "/test-page",
    );
    expect(builderContext.urls.inspectPagesUrl).toHaveBeenCalledWith(
      "/subdirectory",
    );
    expect(builderContext.urls.inspectPagesUrl).toHaveBeenCalledWith(
      "/subdirectory/test-child-page",
    );
  });

  it("should throw an error if the pages directory does not exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);

    expect(() => new Pages("/path/to/nonexistent/collection")).toThrow(
      "Empty Pages Directory: /path/to/nonexistent/collection/pages",
    );
  });

  it("should throw an error if the pages directory is empty", () => {
    vi.spyOn(fs, "readdirSync").mockReturnValueOnce([]);

    expect(() => new Pages("/path/to/empty/collection")).toThrow(
      "Empty Pages Directory: /path/to/empty/collection/pages",
    );
  });

  it("should throw an error for hidden files or directories", () => {
    vi.spyOn(fs, "readdirSync").mockReturnValueOnce([
      {
        name: ".hidden-file.mdx",
        isFile: () => true,
        isDirectory: () => false,
        parentPath: "/path/to/collection/pages",
      },
    ] as any);

    const pages = new Pages("/path/to/collection");

    expect(() => pages.scan("collection")).toThrow(
      'Found invalid entry ".hidden-file.mdx" in /path/to/collection/pages" hidden files or directories (starting with ".") are not allowed.',
    );
  });

  it("should throw an error for invalid file extensions", () => {
    vi.spyOn(fs, "readdirSync").mockReturnValueOnce([
      {
        name: "invalid-file.txt",
        isFile: () => true,
        isDirectory: () => false,
        parentPath: "/path/to/collection/pages",
      },
    ] as any);

    const pages = new Pages("/path/to/collection");

    expect(() => pages.scan("collection")).toThrow(
      'Found invalid entry "invalid-file.txt" in /path/to/collection/pages" only .md or .mdx files are allowed.',
    );
  });
});
