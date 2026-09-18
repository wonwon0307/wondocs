import type { DocsCrumb, DocsItem } from "@wondocs/core/sidebar";

/**
 * Walks a sidebar tree once, producing every link's ancestor trail (crumbs
 * from the tree's root down to that link) keyed by the link's own url.
 * Group ancestors contribute a label-only crumb to their descendants' trails
 * but get no entry of their own (they have no url).
 *
 * @param items - A sidebar group's top-level items, as passed to
 * `addSidebarItem` / stored under one `sidebar` key.
 */
export function buildBreadcrumbIndex(
  items: DocsItem[],
): Record<string, DocsCrumb[]> {
  const index: Record<string, DocsCrumb[]> = {};
  walk(items, []);
  return index;

  function walk(nodes: DocsItem[], trail: DocsCrumb[]): void {
    for (const item of nodes) {
      if (item.type === "separator") continue;

      const nextTrail = [...trail, toCrumb(item)];

      // First occurrence wins, matching the DFS "first match" semantics of
      // a single-target trail search.
      if (item.type === "link" && !(item.url in index)) {
        index[item.url] = nextTrail;
      }

      if (item.items) {
        walk(item.items, nextTrail);
      }
    }
  }
}

function toCrumb(item: Exclude<DocsItem, { type: "separator" }>): DocsCrumb {
  if (item.type === "group") {
    return { label: item.label, icon: item.icon };
  }

  return {
    label: item.label,
    url: item.disabled ? undefined : item.url,
    icon: item.icon,
    external: item.external,
    disabled: item.disabled,
  };
}
