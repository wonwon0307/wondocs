import type { DocsItem, DocsLink } from "@wondocs/core/sidebar";

import { buildBreadcrumbIndex } from "@/lib/breadcrumbs";

const link = (url: string, extra: Partial<DocsLink> = {}): DocsLink => ({
  type: "link",
  label: url,
  url,
  ...extra,
});

describe("buildBreadcrumbIndex", () => {
  const items: DocsItem[] = [
    link("/docs/intro"),
    {
      type: "group",
      label: "Guides",
      items: [
        link("/docs/guides/install"),
        link("/docs/guides/config", {
          items: [link("/docs/guides/config/advanced")],
        }),
      ],
    },
    { type: "separator", label: "More" },
    link("/docs/roadmap", { disabled: true }),
    link("https://example.com", { external: true }),
  ];

  it("indexes a top-level link under its own single-crumb trail", () => {
    const index = buildBreadcrumbIndex(items);
    expect(index["/docs/intro"]).toEqual([
      { label: "/docs/intro", url: "/docs/intro" },
    ]);
  });

  it("prefixes group ancestors as label-only crumbs", () => {
    const index = buildBreadcrumbIndex(items);
    expect(index["/docs/guides/install"]).toEqual([
      { label: "Guides" },
      { label: "/docs/guides/install", url: "/docs/guides/install" },
    ]);
  });

  it("indexes a link that itself has children under its own trail too", () => {
    const index = buildBreadcrumbIndex(items);
    expect(index["/docs/guides/config"]).toEqual([
      { label: "Guides" },
      { label: "/docs/guides/config", url: "/docs/guides/config" },
    ]);
  });

  it("includes ancestor links in a grandchild's trail", () => {
    const index = buildBreadcrumbIndex(items);
    expect(index["/docs/guides/config/advanced"]).toEqual([
      { label: "Guides" },
      { label: "/docs/guides/config", url: "/docs/guides/config" },
      {
        label: "/docs/guides/config/advanced",
        url: "/docs/guides/config/advanced",
      },
    ]);
  });

  it("omits the url for a disabled link crumb", () => {
    const index = buildBreadcrumbIndex(items);
    expect(index["/docs/roadmap"]).toEqual([
      { label: "/docs/roadmap", url: undefined, disabled: true },
    ]);
  });

  it("carries the external flag through", () => {
    const index = buildBreadcrumbIndex(items);
    expect(index["https://example.com"]?.[0]?.external).toBe(true);
  });

  it("skips separators without breaking the trail", () => {
    const index = buildBreadcrumbIndex(items);
    expect(Object.keys(index)).not.toContain(undefined);
    expect(index["/docs/roadmap"]).toBeDefined();
  });

  it("gives no index entry to a group (it has no url)", () => {
    const index = buildBreadcrumbIndex(items);
    expect(index["Guides"]).toBeUndefined();
  });

  it("first occurrence wins for a duplicate url", () => {
    const duped: DocsItem[] = [
      link("/dup", { label: "First" }),
      link("/dup", { label: "Second" }),
    ];
    expect(buildBreadcrumbIndex(duped)["/dup"]).toEqual([
      { label: "First", url: "/dup" },
    ]);
  });

  it("returns an empty index for an empty tree", () => {
    expect(buildBreadcrumbIndex([])).toEqual({});
  });
});
