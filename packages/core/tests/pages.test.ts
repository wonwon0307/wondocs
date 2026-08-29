import * as manifest from "#wondocs/manifest";

import { getPage } from "@/pages/api";

describe("getPage", () => {
  const mockPage = {
    component: () => Promise.resolve(),
    meta: { title: "Test Page" },
  };

  beforeEach(() => {
    vi.spyOn(manifest, "default", "get").mockReturnValue({
      pages: {
        "test-page": mockPage,
      },
      sidebar: {},
    });
  });

  it("should return the page for a valid slug", () => {
    const page = getPage("test-page");
    expect(page).toEqual(mockPage);
  });

  it("should normalize leading and trailing slashes in the slug", () => {
    const page1 = getPage("/test-page");
    const page2 = getPage("test-page/");
    const page3 = getPage("/test-page/");
    expect(page1).toEqual(mockPage);
    expect(page2).toEqual(mockPage);
    expect(page3).toEqual(mockPage);
  });

  it("should throw if no page is found for the given slug", () => {
    expect(() => getPage("non-existent-page")).toThrow(
      '[WonDocs] No page found for slug "non-existent-page".',
    );
  });
});
