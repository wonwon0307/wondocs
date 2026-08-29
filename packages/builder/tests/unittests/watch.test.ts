import * as chokidar from "chokidar";

import { builderContext } from "@/context";
import {
  EmptyCollectionError,
  EmptyPagesDirError,
  MissingMetaJsonError,
} from "@/lib/errors";
import { prepareOutDir } from "@/managers/outdir";
import type { ResolvedConfig } from "@/managers/types";
import { Collection } from "@/models/collection";
import { createSampleMetaJson } from "@/models/meta/sample";
import { createSampleMdx } from "@/models/pages/sample";
import { watchDocs } from "@/watch";

vi.mock("@/managers/outdir", () => ({
  prepareOutDir: vi.fn(),
}));
vi.mock("@/models/collection", () => ({
  Collection: vi.fn().mockImplementation(function () {
    return {
      scan: vi.fn(),
      compilePages: vi.fn(),
    };
  }),
}));
vi.mock("@/models/meta/sample", () => ({
  createSampleMetaJson: vi.fn(),
}));
vi.mock("@/models/pages/sample", () => ({
  createSampleMdx: vi.fn(),
}));

describe("watchDocs - unit tests", () => {
  const mockOn = vi.fn();
  const mockClose = vi.fn();

  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(builderContext.config, "getConfig").mockReturnValue({
    contentsDir: "./collection",
    outDir: "./out",
    allowUnlinkedPages: false,
  } as ResolvedConfig);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(chokidar, "watch").mockReturnValue({
      on: mockOn.mockReturnThis(),
      close: mockClose,
    } as unknown as chokidar.FSWatcher);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should watch docs without errors", async () => {
    const { close } = await watchDocs({
      contentsDir: "./collection",
    });

    expect(prepareOutDir).toHaveBeenCalledOnce();
    expect(prepareOutDir).toHaveBeenCalledWith("./out");

    expect(mockOn).toHaveBeenCalledWith("add", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("change", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("unlink", expect.any(Function));

    expect(typeof close).toBe("function");
    close();
    expect(mockClose).toHaveBeenCalled();
  });

  it("should clear a pending debounce timer on close", async () => {
    const { close } = await watchDocs({
      contentsDir: "./collection",
    });
    const onAdd = mockOn.mock.calls.find((call) => call[0] === "add")?.[1];

    onAdd?.("./collection/guide.md");
    close();

    expect(mockClose).toHaveBeenCalled();

    // the pending rebuild was cancelled, so no further build should occur
    await vi.advanceTimersByTimeAsync(300);
    expect(prepareOutDir).toHaveBeenCalledOnce();
  });

  it("should rebuild on .md, .mdx or meta.json file changes", async () => {
    await watchDocs({
      contentsDir: "./collection",
    });
    const onAdd = mockOn.mock.calls.find((call) => call[0] === "add")?.[1];
    const onChange = mockOn.mock.calls.find(
      (call) => call[0] === "change",
    )?.[1];
    const onUnlink = mockOn.mock.calls.find(
      (call) => call[0] === "unlink",
    )?.[1];

    onAdd?.("./collection/guide.md");
    onChange?.("./collection/guide.mdx");
    onUnlink?.("./collection/meta.json");

    // Fast-forward time to trigger the debounce
    await vi.advanceTimersByTimeAsync(300);

    expect(console.error).not.toHaveBeenCalled();
    expect(prepareOutDir).toHaveBeenCalledTimes(2); // initial build + rebuild

    // does not rebuild on any other file changes
    onAdd?.("./collection/guide.txt");
    onChange?.("./collection/guide.js");
    onUnlink?.("./collection/guide.css");

    await vi.advanceTimersByTimeAsync(300);

    expect(prepareOutDir).toHaveBeenCalledTimes(2); // still 2, no rebuild
  });

  it("should catch errors during rebuild and log them", async () => {
    const testError = new Error("Test error");

    await watchDocs({
      contentsDir: "./collection",
    });

    vi.mocked(Collection).mockImplementationOnce(function () {
      return {
        scan: vi.fn().mockRejectedValue(testError),
        compilePages: vi.fn(),
      };
    });

    const onAdd = mockOn.mock.calls.find((call) => call[0] === "add")?.[1];

    onAdd?.("./collection/guide.md");

    // Fast-forward time to trigger the debounce
    await vi.advanceTimersByTimeAsync(300);

    expect(console.error).toHaveBeenCalledWith(
      "[WonDocs] Error during watch:",
      testError,
    );
  });

  it("should catch empty collection error and build correctly", async () => {
    vi.mocked(Collection).mockImplementationOnce(function () {
      throw new EmptyCollectionError("./collection");
    });

    await watchDocs({
      contentsDir: "./collection",
    });

    expect(createSampleMdx).toHaveBeenCalledWith("./collection");
    expect(createSampleMetaJson).toHaveBeenCalledWith("./collection");
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Collection "./collection" is empty.'),
    );

    // first call throws, second (recovery) call succeeds
    expect(Collection).toHaveBeenCalledTimes(2);
    expect(prepareOutDir).toHaveBeenCalledOnce();
    expect(builderContext.manifest.writeManifest).toHaveBeenCalledOnce();
  });

  it("should catch empty pages error and build correctly", async () => {
    vi.mocked(Collection).mockImplementationOnce(function () {
      throw new EmptyPagesDirError("./collection");
    });

    await watchDocs({
      contentsDir: "./collection",
    });

    expect(createSampleMdx).toHaveBeenCalledWith("./collection");
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Missing the pages directory in "./collection".'),
    );
    expect(prepareOutDir).toHaveBeenCalledOnce();
    expect(builderContext.manifest.writeManifest).toHaveBeenCalledOnce();
  });

  it("should catch missing meta.json error and build correctly", async () => {
    vi.mocked(Collection).mockImplementationOnce(function () {
      throw new MissingMetaJsonError("./collection");
    });

    await watchDocs({
      contentsDir: "./collection",
    });

    expect(createSampleMetaJson).toHaveBeenCalledWith("./collection");
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Missing meta.json in "./collection".'),
    );
    expect(prepareOutDir).toHaveBeenCalledOnce();
    expect(builderContext.manifest.writeManifest).toHaveBeenCalledOnce();
  });

  it("should re-throw any other errors during collection resolution", async () => {
    const testError = new Error("Test error");
    vi.mocked(Collection).mockImplementationOnce(function () {
      throw testError;
    });

    await expect(
      watchDocs({
        contentsDir: "./collection",
      }),
    ).rejects.toThrow(testError);
  });

  it("should watch docs with multiple content directories", async () => {
    vi.spyOn(builderContext.config, "getConfig").mockReturnValue({
      contentsDir: ["./collection1", "./collection2"],
      outDir: "./out",
      allowUnlinkedPages: false,
    } as ResolvedConfig);

    await watchDocs({
      contentsDir: ["./collection1", "./collection2"],
    });

    expect(prepareOutDir).toHaveBeenCalledOnce();
    expect(prepareOutDir).toHaveBeenCalledWith("./out");
  });
});
