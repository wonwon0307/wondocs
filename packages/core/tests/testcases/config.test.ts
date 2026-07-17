import * as fs from "node:fs";

import { loadConfig } from "@/config";

describe("loadConfig", () => {
  it("should load default config when no config is provided", () => {
    const config = loadConfig({});
    expect(config).toEqual({
      root: process.cwd(),
      contentsDir: `${process.cwd()}/docs`,
      baseUrl: "/",
    });
  });

  it("should load custom config when provided", () => {
    const config = loadConfig({
      contentsDir: "custom-docs/",
      baseUrl: "/custom/",
    });
    expect(config).toEqual({
      root: process.cwd(),
      contentsDir: `${process.cwd()}/custom-docs`,
      baseUrl: "/custom/",
    });
  });

  it("should create contentsDir if it doesn't exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    loadConfig({ contentsDir: "new-docs/", baseUrl: "/" });

    expect(fs.mkdirSync).toHaveBeenCalledOnce();
  });

  it("should throw an error if contentsDir is not a subdirectory of the current working directory", () => {
    expect(() =>
      loadConfig({ contentsDir: "../outside-docs/", baseUrl: "/" }),
    ).toThrow(
      "contentsDir must be a subdirectory of the current working directory",
    );
  });
});
