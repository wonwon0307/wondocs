import type { MDXContent } from "mdx/types";
import * as manifest from "#wondocs/manifest";

import { getPage, getPageChildren } from "@/pages/api";

describe("getPage", () => {
  const testComponent: MDXContent = () => "<div>Test Component</div>";
  const mockPage = {
    component: () => Promise.resolve({ default: testComponent }),
    meta: { title: "Test Page" },
    toc: [],
  };

  beforeEach(() => {
    vi.spyOn(manifest, "default", "get").mockReturnValue({
      pages: {
        "test-page": mockPage,
      },
      sidebar: {},
      children: {},
      breadcrumbs: {},
    });
  });

  it("should return the page for a valid slug", () => {
    const page = getPage("test-page");
    expect(page).toEqual(mockPage);
  });

  it("should throw if no page is found for the given slug", () => {
    expect(() => getPage("non-existent-page")).toThrow(
      '[WonDocs] No page found for slug "non-existent-page".',
    );
  });
});

describe("getPageChildren", () => {
  const testComponent: MDXContent = () => "<div>Test Component</div>";
  const child1 = {
    component: () => Promise.resolve({ default: testComponent }),
    meta: { title: "Child 1" },
    toc: [],
  };
  const child2 = {
    component: () => Promise.resolve({ default: testComponent }),
    meta: { title: "Child 2" },
    toc: [],
  };

  beforeEach(() => {
    vi.spyOn(manifest, "default", "get").mockReturnValue({
      pages: {
        "/parent/child1": child1,
        "/parent/child2": child2,
      },
      sidebar: {},
      children: {
        "/parent": ["/parent/child1", "/parent/child2"],
      },
      breadcrumbs: {},
    });
  });

  it("returns each child's url alongside its page data", () => {
    expect(getPageChildren("/parent")).toEqual([
      { url: "/parent/child1", ...child1 },
      { url: "/parent/child2", ...child2 },
    ]);
  });

  it("returns an empty array for a url with no children", () => {
    expect(getPageChildren("/parent/child1")).toEqual([]);
  });

  it("returns an empty array for an unknown url", () => {
    expect(getPageChildren("/nope")).toEqual([]);
  });
});
