import pages from "#wondocs/pages";

import { normalizeSlug } from "@/utils/slug";
import type { Frontmatter, PagesData } from "./types";

export function getPage<T extends Frontmatter>(slug: string): PagesData<T> {
  const key = normalizeSlug(slug);

  const page = pages[key];

  if (!page) {
    throw new Error(`[WonDocs] No page found for slug "${slug}".`);
  }

  return page as PagesData<T>;
}
