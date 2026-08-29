/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "node:fs";

import { Collection } from "@/models/collection";

const mockMetaParse = vi.fn();
const mockPagesScan = vi.fn();

vi.mock("@/models/meta/models", () => ({
  Meta: vi.fn().mockImplementation(function () {
    return {
      parse: mockMetaParse,
      key: "test-key",
      baseUrl: "/test-base-url",
    };
  }),
}));
vi.mock("@/models/pages/models", () => ({
  Pages: vi.fn().mockImplementation(function () {
    return {
      scan: mockPagesScan,
      compilePages: vi.fn(),
    };
  }),
}));

describe("Collection", () => {
  it("should call scan and compile pages correctly", async () => {
    const collection = new Collection("/test-dir");
    await collection.scan();
    await collection.compilePages();

    expect(mockMetaParse).toHaveBeenCalled();
    expect(mockPagesScan).toHaveBeenCalledWith("/test-base-url");
  });

  it("should throw an error if the collection directory does not exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);

    expect(() => new Collection("/non-existent-dir")).toThrow(
      "Empty Collection: /non-existent-dir",
    );
  });

  it("should throw an error if the collection directory is empty", () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue([]);

    expect(() => new Collection("/empty-dir")).toThrow(
      "Empty Collection: /empty-dir",
    );
  });

  it("should throw an error if the collection contains any other entries than 'meta.json' and 'pages'", () => {
    vi.spyOn(fs, "readdirSync").mockReturnValue([
      { name: "meta.json", isFile: () => true, isDirectory: () => false },
      { name: "pages", isFile: () => false, isDirectory: () => true },
      { name: "extra-file.txt", isFile: () => true, isDirectory: () => false },
    ] as any);

    expect(() => new Collection("/invalid-dir")).toThrow(
      'Invalid collection directory "/invalid-dir": a collection must contain exactly 2 entries: "meta.json" and "pages" directory.',
    );
  });
});
