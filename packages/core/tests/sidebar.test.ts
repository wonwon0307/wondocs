import * as manifest from "#wondocs/manifest";

import { getSidebar } from "@/sidebar/api";

describe("getSidebar", () => {
  beforeEach(() => {
    vi.spyOn(manifest, "default", "get").mockReturnValue({
      pages: {},
      sidebar: {
        group1: [],
        group2: [],
      },
    });
  });

  it("should return the group for a valid key", () => {
    const group = getSidebar("group1");
    expect(group).toEqual([]);
  });

  it("should return the single group if no parameter is provided", () => {
    vi.spyOn(manifest, "default", "get").mockReturnValueOnce({
      pages: {},
      sidebar: {
        "": [],
      },
    });

    const group = getSidebar();
    expect(group).toEqual([]);
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
