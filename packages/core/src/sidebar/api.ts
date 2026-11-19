import manifest from "#wondocs/manifest";

import type { DocsCrumb, DocsItem } from "./types";

/**
 * Resolves a collection key against the generated manifest. An omitted key
 * resolves to the project's sole collection.
 *
 * @throws If `key` matches no group, or `key` is omitted and the project does
 * not have exactly one collection.
 */
function resolveKey(key?: string): string {
  const keys = Object.keys(manifest.sidebar);

  if (key !== undefined) {
    if (!keys.includes(key)) {
      throw new Error(
        `[WonDocs] No group found for key "${key}". ` +
          `Available groups: ${keys.join(", ")}`,
      );
    }
    return key;
  }

  if (keys.length !== 1) {
    throw new Error(
      `[WonDocs] No single group found. ` +
        `Available groups: ${keys.join(", ")}`,
    );
  }
  return keys[0];
}

/**
 * Looks up a sidebar group from the generated `#wondocs/sidebar` manifest.
 *
 * @param key - Collection key to look up. Omit it to fetch the sole
 * collection's group, for projects with a single collection.
 * @returns The sidebar items for that group.
 * @throws If no group exists for `key`, or `key` is omitted and the project
 * does not have exactly one collection.
 */
export function getSidebar(key?: string): DocsItem[] {
  return manifest.sidebar[resolveKey(key)];
}

/**
 * Looks up a page's breadcrumb trail from the generated `#wondocs/pages`
 * manifest, precomputed at build time by walking the sidebar tree from its
 * root down to the link whose `url` matches.
 *
 * @param url - Page URL, matched verbatim against sidebar `link` urls (same
 * lookup semantics as `getPage`: no normalization, case-sensitive).
 * @param key - Collection key, resolved the same way as {@link getSidebar}.
 * Omit it to use the sole collection's group.
 * @returns The ancestor crumbs, ending with the page itself. Group ancestors
 * appear as label-only crumbs; the final crumb carries the page's own `url`.
 * @throws If `key` resolves to no sidebar group, or no link matches `url`.
 */
export function getBreadcrumbs(url: string, key?: string): DocsCrumb[] {
  const trail = manifest.breadcrumbs[resolveKey(key)]?.[url];

  if (!trail) {
    throw new Error(`[WonDocs] No breadcrumb trail found for url "${url}".`);
  }

  return trail;
}
