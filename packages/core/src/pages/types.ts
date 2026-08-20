export interface DocsFrontmatter {
  title: string;
  description?: string;
}

export type DocsPageData<T extends DocsFrontmatter> = {
  component: () => Promise<unknown>;
  meta: T;
};
