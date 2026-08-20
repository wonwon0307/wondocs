import * as chokidar from "chokidar";

import * as builder from "@/build";
import { watchDocs } from "@/watch";

vi.mock("@/build", () => ({
  buildDocs: vi.fn().mockResolvedValue(undefined),
}));

describe("watchDocs", () => {
  const mockOn = vi.fn();
  const mockClose = vi.fn();

  const config = {
    root: "/test-root",
    contentsDir: "/test-root/docs",
    mdx: {},
  };

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

  it("should call buildDocs and watch, register rebuild handler, and return close handle", async () => {
    const { close } = await watchDocs(config);

    expect(builder.buildDocs).toHaveBeenCalledWith(config);
    expect(chokidar.watch).toHaveBeenCalledWith("/test-root/docs", {
      ignoreInitial: true,
    });

    expect(mockOn).toHaveBeenCalledWith("add", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("change", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("unlink", expect.any(Function));

    expect(typeof close).toBe("function");
    close();
    expect(mockClose).toHaveBeenCalled();
  });

  it("should rebuild on .md, .mdx or meta.json file changes", async () => {
    await watchDocs(config);
    const onAdd = mockOn.mock.calls.find((call) => call[0] === "add")?.[1];
    const onChange = mockOn.mock.calls.find(
      (call) => call[0] === "change",
    )?.[1];
    const onUnlink = mockOn.mock.calls.find(
      (call) => call[0] === "unlink",
    )?.[1];

    onAdd?.("/test-root/docs/guide.md");
    await vi.runAllTimersAsync();
    expect(builder.buildDocs).toHaveBeenCalledTimes(2); // initial build + rebuild

    onChange?.("/test-root/docs/guide.mdx");
    await vi.runAllTimersAsync();
    expect(builder.buildDocs).toHaveBeenCalledTimes(3);

    onUnlink?.("/test-root/docs/meta.json");
    await vi.runAllTimersAsync();
    expect(builder.buildDocs).toHaveBeenCalledTimes(4);

    // should not rebuild on any other file changes
    onChange?.("/test-root/docs/image.png");
    await vi.runAllTimersAsync();
    expect(builder.buildDocs).toHaveBeenCalledTimes(4);
  });

  it("should debounce rapid changes into one rebuild", async () => {
    await watchDocs(config);
    const onChange = mockOn.mock.calls.find(
      (call) => call[0] === "change",
    )?.[1];

    onChange?.("/test-root/docs/a.md");
    onChange?.("/test-root/docs/b.md");
    onChange?.("/test-root/docs/c.md");
    await vi.runAllTimersAsync();
    expect(builder.buildDocs).toHaveBeenCalledTimes(2);
  });

  it("should catch rebuild errors and keep the watcher alive", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.spyOn(builder, "buildDocs")
      .mockResolvedValueOnce(undefined) // initial build should pass
      .mockRejectedValueOnce(new Error("Build failed"));

    await watchDocs(config);
    const onChange = mockOn.mock.calls.find(
      (call) => call[0] === "change",
    )?.[1];

    onChange?.("/test-root/docs/guide.md");
    await expect(vi.runAllTimersAsync()).resolves.not.toThrow();
    expect(consoleError).toHaveBeenCalledWith("[WonDocs]", expect.any(Error));

    consoleError.mockRestore();
  });

  it("should cancel pending timer and close watcher on close()", async () => {
    const { close } = await watchDocs(config);
    const onChange = mockOn.mock.calls.find(
      (call) => call[0] === "change",
    )?.[1];

    onChange?.("/test-root/docs/guide.md");
    close();
    await vi.runAllTimersAsync();
    expect(mockClose).toHaveBeenCalled();
    expect(builder.buildDocs).toHaveBeenCalledOnce();
  });
});
