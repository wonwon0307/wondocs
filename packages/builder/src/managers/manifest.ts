import { join } from "node:path";
import { type TocItem } from "remark-flexible-toc";
import type { DocsFrontmatter } from "@wondocs/core/pages";
import type { DocsItem } from "@wondocs/core/sidebar";

import { atomicWrite } from "@/lib/files";
import type { WonDocsManifest } from "./types";

export class ManifestManager {
  protected manifest: WonDocsManifest;
  private readonly keySet: Set<string>;
  private readonly baseUrlSet: Set<string>;

  constructor() {
    this.manifest = {
      pages: {},
      sidebar: {},
    };
    this.keySet = new Set();
    this.baseUrlSet = new Set();
  }

  public reset(): void {
    this.manifest = {
      pages: {},
      sidebar: {},
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
  }

  public addSidebarItem(key: string, item: DocsItem): void {
    if (!this.manifest.sidebar[key]) {
      this.manifest.sidebar[key] = [];
    }
    this.manifest.sidebar[key].push(item);
  }

  public async writeManifest(outDir: string): Promise<void> {
    const manifestPath = join(outDir, "manifest.js");

    // `component`는 함수이므로 JSON.stringify로 직렬화할 수 없다 (조용히 누락됨).
    // pages는 코드로 직접 조립하고, meta/sidebar만 순수 데이터로 직렬화한다.
    const pagesEntries = Object.entries(this.manifest.pages)
      .map(([url, page]) => {
        const importPath = JSON.stringify(`./pages${url}.js`);
        return `  ${JSON.stringify(url)}: { component: () => import(${importPath}), meta: ${JSON.stringify(page.meta)}, toc: ${JSON.stringify(page.toc)} }`;
      })
      .join(",\n");

    const manifestContent =
      `export default {\n` +
      `  pages: {\n${pagesEntries}\n  },\n` +
      `  sidebar: ${JSON.stringify(this.manifest.sidebar, null, 2)},\n` +
      `};\n`;

    await atomicWrite(manifestPath, manifestContent);
  }
}
