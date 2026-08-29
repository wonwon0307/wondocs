/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "node:fs";

import { buildDocs } from "@/build";

vi.unmock("@/context");

describe("buildDocs - integration test using fs mocks", () => {
  const cwd = process.cwd();
  vi.spyOn(fs, "readdirSync").mockImplementation((path) => {
    if (path.toString().endsWith("pages")) {
      return [
        {
          name: "test-page.mdx",
          isFile: () => true,
          isDirectory: () => false,
          parentPath: `${cwd}/collection/pages`,
        },
        {
          name: "subdirectory",
          isFile: () => false,
          isDirectory: () => true,
          parentPath: `${cwd}/collection/pages`,
        },
        {
          name: "index.mdx",
          isFile: () => true,
          isDirectory: () => false,
          parentPath: `${cwd}/collection/pages/subdirectory`,
        },
        {
          name: "test-child-page.mdx",
          isFile: () => true,
          isDirectory: () => false,
          parentPath: `${cwd}/collection/pages/subdirectory`,
        },
      ] as any;
    } else {
      return [
        { name: "meta.json", isFile: () => true, isDirectory: () => false },
        { name: "pages", isFile: () => false, isDirectory: () => true },
      ] as any;
    }
  });
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});

  it("should build docs correctly after reading the file system", async () => {
    await expect(
      buildDocs({
        contentsDir: "./collection",
      }),
    ).resolves.not.toThrow();

    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      "[WonDocs] Build report: Successfully linked 3 URLs out of 3 in the sidebar.",
    );
    expect(console.log).toHaveBeenCalledWith(
      "[WonDocs] Build completed successfully!",
    );
  });
});
