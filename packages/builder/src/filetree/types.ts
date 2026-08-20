import type { DocsFrontmatter, DocsPageData } from "@wondocs/core/pages";

// slug -> PagesData tree
export type FileTree = Record<string, string>;

export type FileTreeScanResult = {
  tree: FileTree;
  hrefs: Set<string>;
};

// slug로 페이지의 manifest를 조회할 수 있는 구조
export type PagesManifest<T extends DocsFrontmatter> = Record<
  string,
  DocsPageData<T>
>;
