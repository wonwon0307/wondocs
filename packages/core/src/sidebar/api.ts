import manifest from "#wondocs/manifest";

import type { DocsCrumb, DocsItem } from "./types";

/**
 * Looks up a sidebar group from the generated `#wondocs/sidebar` manifest.
 *
 * @param key - Collection key to look up. Omit it to fetch the default
 * (unkeyed, `""`) group, used when a project has a single collection.
 * @returns The sidebar items for that group.
 * @throws If no group exists for `key` (or no default group when `key` is omitted).
 */
export function getSidebar(key?: string): DocsItem[] {
  if (key !== undefined) {
    const group = manifest.sidebar[key];
    if (!group) {
      throw new Error(
        `[WonDocs] No group found for key "${key}". ` +
          `Available groups: ${Object.keys(manifest.sidebar).join(", ")}`,
      );
    }
    return group;
  }

  const group = manifest.sidebar[""];
  if (!group) {
    throw new Error(
      `[WonDocs] No single group found. ` +
        `Available groups: ${Object.keys(manifest.sidebar).join(", ")}`,
    );
  }
  return group;
}

/**
 * Looks up a page's breadcrumb trail from the generated `#wondocs/pages`
 * manifest, precomputed at build time by walking the sidebar tree from its
 * root down to the link whose `url` matches.
 *
 * @param url - Page URL, matched verbatim against sidebar `link` urls (same
 * lookup semantics as `getPage`: no normalization, case-sensitive).
 * @param key - Collection key, resolved the same way as {@link getSidebar}.
 * Omit it to use the default (unkeyed, `""`) group.
 * @returns The ancestor crumbs, ending with the page itself. Group ancestors
 * appear as label-only crumbs; the final crumb carries the page's own `url`.
 * @throws If `key` resolves to no sidebar group, or no link matches `url`.
 */
export function getBreadcrumbs(url: string, key?: string): DocsCrumb[] {
  // Reused only for its key-resolution/validation error messages; the trail
  // itself comes from the precomputed index below.
  getSidebar(key);

  const trail = manifest.breadcrumbs[key ?? ""]?.[url];

  if (!trail) {
    throw new Error(`[WonDocs] No breadcrumb trail found for url "${url}".`);
  }

  return trail;
}
