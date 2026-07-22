import * as fs from "node:fs";

import { loadConfig } from "@/config";

describe("loadConfig", () => {
  it("should load default config when no config is provided", () => {
    const config = loadConfig({});
    expect(config).toEqual({
      root: process.cwd(),
      contentsDir: `${process.cwd()}/docs`,
      mdx: {},
    });
  });

  it("should load custom config when provided", () => {
    const config = loadConfig({
      contentsDir: "custom-docs/",
    });
    expect(config).toEqual({
      root: process.cwd(),
      contentsDir: `${process.cwd()}/custom-docs`,
      mdx: {},
    });
  });

  it("should pass through custom mdx remark/rehype plugins", () => {
    const remarkPlugin = () => {};
    const rehypePlugin = () => {};

    const config = loadConfig({
      mdx: { remarkPlugins: [remarkPlugin], rehypePlugins: [rehypePlugin] },
    });

    expect(config.mdx).toEqual({
      remarkPlugins: [remarkPlugin],
      rehypePlugins: [rehypePlugin],
    });
  });

  it("should create contentsDir if it doesn't exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    loadConfig({ contentsDir: "new-docs/" });

    expect(fs.mkdirSync).toHaveBeenCalledOnce();
  });

  it("should throw an error if contentsDir is not a subdirectory of the current working directory", () => {
    expect(() => loadConfig({ contentsDir: "../outside-docs/" })).toThrow(
      "contentsDir must be a subdirectory of the current working directory",
    );
  });
});
