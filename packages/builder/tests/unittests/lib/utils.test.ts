import { getParentUrl, relPathToUrl } from "@/lib/url";

describe("relPathToUrl - corner case", () => {
  it("should early exit", () => {
    expect(relPathToUrl("/")).toBe("/");
  });
});

describe("getParentUrl", () => {
  it("returns the immediate parent for a nested url", () => {
    expect(getParentUrl("/parent/child1")).toBe("/parent");
  });

  it("returns the root for a top-level url", () => {
    expect(getParentUrl("/getting-started")).toBe("/");
  });

  it("returns the grandparent for a deeply nested url", () => {
    expect(getParentUrl("/parent/child/grandchild")).toBe("/parent/child");
  });
});
