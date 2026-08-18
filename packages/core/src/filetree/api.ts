import pages from "#wondocs/pages";

import { normalizeSlug } from "@/utils/slug";
import type { Frontmatter, PagesData } from "./types";

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
export function getPage<T extends Frontmatter>(slug: string): PagesData<T> {
  const key = normalizeSlug(slug);

  const page = pages[key];

  if (!page) {
    throw new Error(`[WonDocs] No page found for slug "${slug}".`);
  }

  return page as PagesData<T>;
}
