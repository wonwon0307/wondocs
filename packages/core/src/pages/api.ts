import manifest from "#wondocs/manifest";

import type { DocsFrontmatter, DocsPageData } from "./types";

/**
 * Looks up a page's lazy component loader and frontmatter from the generated
 * `#wondocs/pages` manifest.
 *
 * @typeParam T - Expected frontmatter shape for this page.
 * @param slug - Page slug (normalized before lookup, so leading/trailing
 * slashes don't matter). Lookups are case-sensitive.
 * @returns The page's `component` loader and `meta` frontmatter.
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
