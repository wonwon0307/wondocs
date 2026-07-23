import { access } from "node:fs/promises";
import { join } from "node:path";

import { detectCollections } from "./collection/build";
import { buildPages } from "./filetree/build";
import { scanFileTree } from "./filetree/scan";
import { scanMeta } from "./meta/scan";
import { computeReport, printReport } from "./report/build";
import { atomicWrite } from "./utils/files";

import { type CollectionEntry } from "./collection/types";
import { type ResolvedConfig } from "./config/types";
import {
  type FileTree,
  type Frontmatter,
  type PagesManifest,
} from "./filetree/types";
import { type LinkRef, type SidebarManifest } from "./meta/types";

export async function buildDocs(config: ResolvedConfig): Promise<void> {
  const { root, contentsDir, mdx } = config;

  const collections = detectCollections(contentsDir);
  const sidebarData: SidebarManifest = {};
  const filetree: FileTree = {};
  const allLinks: LinkRef[] = [];
  const filetreeHrefs = new Set<string>();
  const prefixToKey = new Map<string, string>(); // 같은 prefix를 사용하는 collection이 없는지 확인
  const outDir = join(root, ".wondocs");

  await ensureGitignore(outDir);

  // 1. 모든 collection을 scan하여 meta.json의 내용과 filetree를 가져온다
  await Promise.all(
    collections.map(async ({ key, path }) => {
      const { prefix, items, links, tree, hrefs } = await scanCollection({
        key,
        path,
      });

      const collidingKey = prefixToKey.get(prefix);
      if (collidingKey !== undefined) {
        throw new Error(
          `[WonDocs] Duplicate prefix "${prefix}" used by both "${collidingKey}" and "${key}"`,
        );
      }
      prefixToKey.set(prefix, key);

      // sidebarData는 key를 기준으로 저장하고
      // pagesData/report 데이터는 그냥 합친다
      sidebarData[key] = items;
      Object.assign(filetree, tree);
      allLinks.push(...links);
      hrefs.forEach((href) => filetreeHrefs.add(href));
    }),
  );

  // 2. report를 계산하고 출력한다 — broken link가 있으면 여기서 던져서, 잘못된 manifest가 기록되지 않도록 한다
  printReport(computeReport(allLinks, filetreeHrefs));

  // 3. pages를 build한다
  const pagesData = await buildPages(filetree, outDir, mdx);

  // 4. manifest 파일 2개를 작성한다
  await Promise.all([
    // 1. sidebar.js 작성
    atomicWrite(
      join(outDir, "sidebar.js"),
      `export default ${JSON.stringify(sidebarData, null, 2)};\n`,
    ),
    // 2. pages.js 작성
    atomicWrite(join(outDir, "pages.js"), buildPagesManifest(pagesData)),
  ]);
}

// pagesData의 component는 함수라 JSON.stringify로 직렬화하면 값이 사라진다 — import() 소스를 직접 생성한다
function buildPagesManifest<T extends Frontmatter>(
  pagesData: PagesManifest<T>,
): string {
  const entries = Object.entries(pagesData)
    .map(([slug, { meta }]) => {
      const importPath = `./pages/${slug}.js`;
      return `  ${JSON.stringify(slug)}: { component: () => import(${JSON.stringify(importPath)}), meta: ${JSON.stringify(meta)} }`;
    })
    .join(",\n");

  return `export default {\n${entries}\n};\n`;
}

async function ensureGitignore(outDir: string): Promise<void> {
  const gitignorePath = join(outDir, ".gitignore");
  try {
    await access(gitignorePath);
  } catch {
    await atomicWrite(gitignorePath, "*\n");
  }
}

async function scanCollection({ key, path }: CollectionEntry) {
  const { prefix, items, links } = await scanMeta(join(path, "meta.json"), key);
  const { tree, hrefs } = await scanFileTree(path, prefix);

  return {
    key,
    prefix,
    items,
    links,
    tree,
    hrefs,
  };
}
