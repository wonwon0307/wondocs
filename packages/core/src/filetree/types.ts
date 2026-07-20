export interface Frontmatter {
  title: string;
  description?: string;
}

export type PagesData<T extends Frontmatter> = {
  component: () => Promise<unknown>;
  meta: T;
};

// slug -> PagesData tree
export type FileTree = Record<string, string>;

export type FileTreeScanResult = {
  tree: FileTree;
  hrefs: Set<string>;
};

export type PagesManifest<T extends Frontmatter> = Record<string, PagesData<T>>;
