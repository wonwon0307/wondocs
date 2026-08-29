import manifest from "#wondocs/manifest";

import type { DocsItem } from "./types";

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
