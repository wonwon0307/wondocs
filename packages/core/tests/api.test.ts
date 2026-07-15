import * as manifest from "#wondocs/manifest";

import { getSidebar } from "@/api/getSidebar";

describe("getSidebar", () => {
  beforeEach(() => {
    vi.spyOn(manifest, "default", "get").mockReturnValue({
      group1: { prefix: "group1", items: [] },
      group2: { prefix: "group2", items: [] },
    });
  });

  it("should return the group for a valid key", () => {
    const group = getSidebar("group1");
    expect(group).toEqual({ prefix: "group1", items: [] });
  });

  it("should return the single group if no parameter is provided", () => {
    vi.spyOn(manifest, "default", "get").mockReturnValue({
      "": { prefix: "", items: [] },
    });

    const group = getSidebar();
    expect(group).toEqual({ prefix: "", items: [] });
  });

  it("should throw if no parameter is provided and no single group exists", () => {
    expect(() => getSidebar()).toThrow(
      "[WonDocs] No single group found. Available groups: group1, group2",
    );
  });

  it("should throw if a non-existent key is provided", () => {
    expect(() => getSidebar("nonExistentGroup")).toThrow(
      '[WonDocs] No group found for key "nonExistentGroup". Available groups: group1, group2',
    );
  });
});
