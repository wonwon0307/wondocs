import { join } from "node:path";
import { type TocItem } from "remark-flexible-toc";
import type { DocsFrontmatter } from "@wondocs/core/pages";
import type { DocsItem } from "@wondocs/core/sidebar";

import { buildBreadcrumbIndex } from "@/lib/breadcrumbs";
import { atomicWrite } from "@/lib/files";
import { getParentUrl } from "@/lib/url";
import type { WonDocsManifest } from "./types";

export class ManifestManager {
  protected manifest: WonDocsManifest;
  private readonly keySet: Set<string>;
  private readonly baseUrlSet: Set<string>;

  constructor() {
    this.manifest = {
      pages: {},
      sidebar: {},
      children: {},
      breadcrumbs: {},
    };
    this.keySet = new Set();
    this.baseUrlSet = new Set();
  }

  public reset(): void {
    this.manifest = {
      pages: {},
      sidebar: {},
      children: {},
      breadcrumbs: {},
    };
    this.keySet.clear();
    this.baseUrlSet.clear();
  }

  public checkCollection(key: string, baseUrl: string): void {
    if (this.keySet.has(key)) {
      throw new Error(`Duplicate collection key: "${key}"`);
    }
    if (this.baseUrlSet.has(baseUrl)) {
      throw new Error(`Duplicate collection baseUrl: "${baseUrl}"`);
    }
    this.keySet.add(key);
    this.baseUrlSet.add(baseUrl);
  }

  public addPage<T extends DocsFrontmatter>(
    url: string,
    frontmatter: T,
    toc: TocItem[],
  ): void {
    this.manifest.pages[url] = {
      component: () => import(`./pages${url}.js`),
      meta: frontmatter,
      toc,
    };

    if (url === "/") {
      return;
    }

    const parentUrl = getParentUrl(url);
    if (!this.manifest.children[parentUrl]) {
      this.manifest.children[parentUrl] = [];
    }
    this.manifest.children[parentUrl].push(url);
  }

  public addSidebarItem(key: string, item: DocsItem): void {
    if (!this.manifest.sidebar[key]) {
      this.manifest.sidebar[key] = [];
    }
    this.manifest.sidebar[key].push(item);
  }

  public async writeManifest(outDir: string): Promise<void> {
    const manifestPath = join(outDir, "manifest.js");

    // 모든 sidebar 항목이 채워진 뒤 한 번만 순회해, 매 getBreadcrumbs 호출마다
    // 트리를 다시 훑지 않도록 breadcrumbs를 미리 계산해 둔다.
    for (const [key, items] of Object.entries(this.manifest.sidebar)) {
      this.manifest.breadcrumbs[key] = buildBreadcrumbIndex(items);
    }

    // `component`는 함수이므로 JSON.stringify로 직렬화할 수 없다 (조용히 누락됨).
    // pages는 코드로 직접 조립하고, meta/sidebar만 순수 데이터로 직렬화한다.
    const pagesEntries = Object.entries(this.manifest.pages)
      .map(([url, page]) => {
        const importPath = JSON.stringify(`./pages${url}.js`);
        return (
          `  ${JSON.stringify(url)}: {\n` +
          `\tcomponent: () => import(${importPath}),\n` +
          `\tmeta: ${JSON.stringify(page.meta)},\n` +
          `\ttoc: ${JSON.stringify(page.toc)}\n` +
          `  }`
        );
      })
      .join(",\n");

    const manifestContent =
      `export default {\n` +
      `  pages: {\n${pagesEntries}\n  },\n` +
      `  sidebar: ${JSON.stringify(this.manifest.sidebar, null, 2)},\n` +
      `  children: ${JSON.stringify(this.manifest.children, null, 2)},\n` +
      `  breadcrumbs: ${JSON.stringify(this.manifest.breadcrumbs, null, 2)},\n` +
      `};\n`;

    await atomicWrite(manifestPath, manifestContent);
  }
}
