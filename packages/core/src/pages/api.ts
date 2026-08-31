import manifest from "#wondocs/manifest";

import type { DocsFrontmatter, DocsPageData } from "./types";

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
