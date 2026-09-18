import * as manifest from "#wondocs/manifest";

import { getBreadcrumbs } from "@/sidebar/api";
import type { DocsCrumb, DocsItem, DocsLink } from "@/sidebar/types";

const link = (url: string, extra: Partial<DocsLink> = {}): DocsLink => ({
  type: "link",
  label: url,
  url,
  ...extra,
});

describe("getBreadcrumbs", () => {
  // The sidebar tree itself is only used for `getSidebar`'s key validation
  // now — the trails below are what a build-time walk of this tree would
  // produce (see builder's `buildBreadcrumbIndex` for that walk).
  const sidebar: Record<string, DocsItem[]> = {
    docs: [
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
    ],
    "": [link("/single")],
  };

  const breadcrumbs: Record<string, Record<string, DocsCrumb[]>> = {
    docs: {
      "/docs/intro": [{ label: "/docs/intro", url: "/docs/intro" }],
      "/docs/guides/install": [
        { label: "Guides" },
        { label: "/docs/guides/install", url: "/docs/guides/install" },
      ],
      "/docs/guides/config": [
        { label: "Guides" },
        { label: "/docs/guides/config", url: "/docs/guides/config" },
      ],
      "/docs/guides/config/advanced": [
        { label: "Guides" },
        { label: "/docs/guides/config", url: "/docs/guides/config" },
        {
          label: "/docs/guides/config/advanced",
          url: "/docs/guides/config/advanced",
        },
      ],
      "/docs/roadmap": [
        { label: "/docs/roadmap", url: undefined, disabled: true },
      ],
      "https://example.com": [
        {
          label: "https://example.com",
          url: "https://example.com",
          external: true,
        },
      ],
    },
    "": {
      "/single": [{ label: "/single", url: "/single" }],
    },
  };

  beforeEach(() => {
    vi.spyOn(manifest, "default", "get").mockReturnValue({
      pages: {},
      sidebar,
      children: {},
      breadcrumbs,
    });
  });

  it("returns a single crumb for a top-level link", () => {
    expect(getBreadcrumbs("/docs/intro", "docs")).toEqual([
      { label: "/docs/intro", url: "/docs/intro" },
    ]);
  });

  it("prefixes group ancestors as label-only crumbs", () => {
    expect(getBreadcrumbs("/docs/guides/install", "docs")).toEqual([
      { label: "Guides" },
      { label: "/docs/guides/install", url: "/docs/guides/install" },
    ]);
  });

  it("includes ancestor links that have their own children", () => {
    const trail = getBreadcrumbs("/docs/guides/config/advanced", "docs");
    expect(trail.map((c) => c.label)).toEqual([
      "Guides",
      "/docs/guides/config",
      "/docs/guides/config/advanced",
    ]);
  });

  it("omits the url for a disabled link crumb", () => {
    expect(getBreadcrumbs("/docs/roadmap", "docs")).toEqual([
      { label: "/docs/roadmap", url: undefined, disabled: true },
    ]);
  });

  it("carries the external flag through", () => {
    const [crumb] = getBreadcrumbs("https://example.com", "docs");
    expect(crumb.external).toBe(true);
  });

  it("resolves the default group when no key is given", () => {
    expect(getBreadcrumbs("/single")).toEqual([
      { label: "/single", url: "/single" },
    ]);
  });

  it("throws when no link matches the url", () => {
    expect(() => getBreadcrumbs("/docs/missing", "docs")).toThrow(
      '[WonDocs] No breadcrumb trail found for url "/docs/missing".',
    );
  });

  it("throws (via getSidebar) when the key is unknown", () => {
    expect(() => getBreadcrumbs("/x", "nope")).toThrow(
      '[WonDocs] No group found for key "nope".',
    );
  });
});
