import manifest from "#wondocs/manifest";

import type { DocsFrontmatter, DocsPageChild, DocsPageData } from "./types";

/**
 * Looks up a page's lazy component loader and frontmatter from the generated
 * `#wondocs/pages` manifest.
 *
 * @typeParam T - Expected frontmatter shape for this page.
 * @param slug - Page slug, looked up in the manifest verbatim: it must match a
 * manifest key exactly (no leading/trailing slashes, case-sensitive).
 * @returns The page's `component` loader, `meta` frontmatter, and `toc`.
 * @throws If no page exists for `slug`.
 */
export function getPage<T extends DocsFrontmatter>(
  slug: string,
): DocsPageData<T> {
  const page = manifest.pages[slug];

  if (!page) {
    throw new Error(`[WonDocs] No page found for slug "${slug}".`);
  }

  return page as DocsPageData<T>;
}

/**
 * Looks up a page's one-level-deep children from the generated
 * `#wondocs/pages` manifest, derived at build time from page urls (e.g.
 * "/parent/child1" is a child of "/parent") independent of the sidebar
 * structure or whether `url` itself is a registered page.
 *
 * @typeParam T - Expected frontmatter shape for the child pages.
 * @param url - Parent url, looked up verbatim (same lookup semantics as
 * {@link getPage}: no normalization, case-sensitive).
 * @returns The matching pages' `url`, `component` loader, `meta`, and `toc`.
 * Empty array if `url` has no children (including if `url` is unknown).
 */
export function getPageChildren<T extends DocsFrontmatter>(
  url: string,
): DocsPageChild<T>[] {
  const childUrls = manifest.children[url] ?? [];

  return childUrls.map((childUrl) => ({
    url: childUrl,
    ...(manifest.pages[childUrl] as DocsPageData<T>),
  }));
}
