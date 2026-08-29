import { ConfigManager } from "@/managers/config";

describe("ConfigManager", () => {
  it("sets default config correctly", () => {
    const configManager = new ConfigManager();

    configManager.setConfig({});

    const config = configManager.getConfig();

    expect(config).toEqual({
      outDir: expect.any(String),
      contentsDir: expect.any(String),
      mdx: {},
      autoDetectExternal: true,
      allowUnlinkedPages: false,
    });
  });

  it("overrides user defined config correctly", () => {
    const configManager = new ConfigManager();

    const userConfig = {
      contentsDir: "custom-docs/",
      mdx: { remarkPlugins: [], rehypePlugins: [] },
      autoDetectExternal: false,
      allowUnlinkedPages: true,
    };

    configManager.setConfig(userConfig);

    const config = configManager.getConfig();

    expect(config).toEqual({
      outDir: expect.any(String),
      contentsDir: expect.stringContaining("custom-docs"),
      mdx: { remarkPlugins: [], rehypePlugins: [] },
      autoDetectExternal: false,
      allowUnlinkedPages: true,
    });
  });

  it("handles multiple contentsDir paths correctly", () => {
    const configManager = new ConfigManager();

    const userConfig = {
      contentsDir: ["docs/group1", "docs/group2"],
    };

    configManager.setConfig(userConfig);

    const config = configManager.getConfig();

    expect(config.contentsDir).toEqual(
      expect.arrayContaining([
        expect.stringContaining("docs/group1"),
        expect.stringContaining("docs/group2"),
      ]),
    );
  });

  it("throws error when contentsDir is outside the current working directory", () => {
    const configManager = new ConfigManager();

    expect(() =>
      configManager.setConfig({ contentsDir: "../outside-dir" }),
    ).toThrow(
      'Invalid contentsDir "../outside-dir": contentsDir must be a subdirectory of the current working directory',
    );
  });

  it("throws error when getConfig is called before setConfig", () => {
    const configManager = new ConfigManager();

    expect(() => configManager.getConfig()).toThrow(
      "Config is not available. Please call setConfig() before calling getConfig().",
    );
  });
});
