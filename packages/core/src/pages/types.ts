import type { MDXContent } from "mdx/types";
import type { TocItem } from "remark-flexible-toc";

export type DocsTocEntry = TocItem;

export interface DocsFrontmatter {
  title?: string;
  description?: string;
}

export type DocsMdxModule = {
  default: MDXContent;
};

export type DocsPageData<T extends DocsFrontmatter> = {
  component: () => Promise<DocsMdxModule>;
  meta: T | null;
  toc: DocsTocEntry[];
};

export type DocsPageChild<T extends DocsFrontmatter> = DocsPageData<T> & {
  url: string;
};
