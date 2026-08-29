import * as fs from "node:fs";

import { builderContext } from "@/context";
import * as files from "@/lib/files";
import type { ResolvedConfig } from "@/managers/types";
import { Meta } from "@/models/meta/models";

describe("Meta", () => {
  const testConfig = {
    autoDetectExternal: true,
  };
  const testSidebarItems = [
    "[Home-Link](/)",
    "[Test-Link](/test-link)",
    "---",
    "[star][Test-Link-With-Icon](/test-link-with-icon)",
    "[Test-External-Link](https://example.com)",
    "![Test-Disabled-Link](/test-disabled-link)",
    "---Separator Label---",
    {
      type: "group",
      label: "Test Group",
      items: ["[Test-Group-Link](/test-group-link)"],
    },
    {
      type: "link",
      label: "Test Link With Children",
      url: "/test-link-with-children",
      items: ["[Test-Child-Link](/test-child-link)"],
    },
    {
      type: "link",
      label: "Test External Link 2",
      url: "/test-external-link-2",
      external: true,
    },
  ];
  vi.spyOn(builderContext.config, "getConfig").mockReturnValue(
    testConfig as ResolvedConfig,
  );
  vi.spyOn(files, "parseJsonFile").mockResolvedValue({
    sidebar: testSidebarItems,
  });

  it("should parse meta.json correctly", async () => {
    const meta = new Meta("/path/to/collection");
    await meta.parse();

    expect(meta.baseUrl).toBe("collection");
    expect(meta.key).toBe("collection");

    expect(builderContext.urls.addMetaUrl).toHaveBeenCalledWith(
      "/collection/test-link",
    );
    expect(builderContext.urls.addMetaUrl).toHaveBeenCalledWith(
      "/collection/test-link-with-icon",
    );
    expect(builderContext.urls.addMetaUrl).toHaveBeenCalledWith(
      "/collection/test-link-with-children",
    );
    expect(builderContext.urls.addMetaUrl).toHaveBeenCalledWith(
      "/collection/test-child-link",
    );

    expect(builderContext.urls.addMetaUrl).not.toHaveBeenCalledWith(
      "https://example.com",
    );
    expect(builderContext.urls.addMetaUrl).not.toHaveBeenCalledWith(
      "/collection/test-disabled-link",
    );
  });

  it("should handle baseUrl and key overrides correctly", async () => {
    vi.spyOn(files, "parseJsonFile").mockResolvedValueOnce({
      sidebar: testSidebarItems,
      baseUrl: "custom-base-url",
      key: "custom-key",
    });
    const meta = new Meta("/path/to/collection");
    await meta.parse();

    expect(meta.baseUrl).toBe("custom-base-url");
    expect(meta.key).toBe("custom-key");
  });

  it("should handle root dir (blank baseUrl) correctly", async () => {
    vi.spyOn(files, "parseJsonFile").mockResolvedValueOnce({
      sidebar: testSidebarItems,
    });
    const meta = new Meta("");
    await meta.parse();

    expect(meta.baseUrl).toBe("");
    expect(meta.key).toBe("");
  });

  it("should throw an error if meta.json does not exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);

    expect(() => new Meta("/path/to/collection")).toThrow(
      "Missing meta.json in collection: /path/to/collection",
    );
  });

  describe("invalid meta.json", () => {
    it("should throw an error if invalid shorthand string is provided", async () => {
      vi.spyOn(files, "parseJsonFile").mockResolvedValueOnce({
        sidebar: ["Invalid"],
      });

      const meta = new Meta("/path/to/collection");

      await expect(meta.parse()).rejects.toThrow(
        'Invalid shorthand string: "Invalid".',
      );
    });

    it("should throw an error if invalid separator shorthand string is provided", async () => {
      vi.spyOn(files, "parseJsonFile").mockResolvedValueOnce({
        sidebar: ["------"],
      });

      const meta = new Meta("/path/to/collection");

      await expect(meta.parse()).rejects.toThrow(
        'Invalid shorthand string: "------".',
      );
    });

    it("should throw an error if invalid meta.json structure is provided", async () => {
      vi.spyOn(files, "parseJsonFile").mockResolvedValueOnce({
        sidebar: "Not an array",
      });

      const meta = new Meta("/path/to/collection");

      await expect(meta.parse()).rejects.toThrow(
        'Invalid meta.json at "/path/to/collection/meta.json":',
      );
    });

    it("should throw an error if invalid sidebar item is provided", async () => {
      vi.spyOn(files, "parseJsonFile").mockResolvedValueOnce({
        sidebar: [
          {
            type: "invalid",
          },
        ],
        invalidField: "This field is not allowed",
      });

      const meta = new Meta("/path/to/collection");

      await expect(meta.parse()).rejects.toThrow(
        'Invalid meta.json at "/path/to/collection/meta.json":',
      );
    });

    it("should throw an error if invalid sidebar item is provided", async () => {
      vi.spyOn(files, "parseJsonFile").mockResolvedValueOnce([]);

      const meta = new Meta("/path/to/collection");

      await expect(meta.parse()).rejects.toThrow(
        'Invalid meta.json at "/path/to/collection/meta.json":',
      );
    });
  });
});
