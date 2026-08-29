import { buildDocs } from "@/build";
import { builderContext } from "@/context";
import type { ResolvedConfig } from "@/managers/types";

vi.mock("@/models/collection", () => ({
  Collection: vi.fn().mockImplementation(function () {
    return {
      scan: vi.fn(),
      compilePages: vi.fn(),
    };
  }),
}));

describe("buildDocs - unit tests", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});

  it("should build docs without errors", async () => {
    vi.spyOn(builderContext.config, "getConfig").mockReturnValue({
      contentsDir: "./collection",
      outDir: "./out",
      allowUnlinkedPages: false,
    } as ResolvedConfig);

    await expect(
      buildDocs({
        contentsDir: "./collection",
      }),
    ).resolves.not.toThrow();

    expect(console.log).toHaveBeenCalledWith(
      "[WonDocs] Build completed successfully!",
    );
  });

  it("should build with multiple content directories", async () => {
    vi.spyOn(builderContext.config, "getConfig").mockReturnValue({
      contentsDir: ["./collection1", "./collection2"],
      outDir: "./out",
      allowUnlinkedPages: false,
    } as ResolvedConfig);

    await expect(
      buildDocs({
        contentsDir: ["./collection1", "./collection2"],
      }),
    ).resolves.not.toThrow();

    expect(console.log).toHaveBeenCalledWith(
      "[WonDocs] Build completed successfully!",
    );
  });

  it("should catch errors and re-throw with leading message", async () => {
    const error = new Error("Test error");
    vi.spyOn(builderContext.config, "setConfig").mockImplementationOnce(() => {
      throw error;
    });

    await expect(
      buildDocs({
        contentsDir: "./collection",
      }),
    ).rejects.toThrow(error);

    expect(console.error).toHaveBeenCalledWith(
      "[WonDocs] Error during build:",
      error,
    );
  });
});
