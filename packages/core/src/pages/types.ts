import type { MDXContent } from "mdx/types";
import type { TocItem as DocsTocEntry } from "remark-flexible-toc";

export interface DocsFrontmatter {
  title?: string;
  description?: string;
}

type ComponentReturnType = {
  default: MDXContent;
};

export type DocsPageData<T extends DocsFrontmatter> = {
  component: () => Promise<ComponentReturnType>;
  meta: T;
  toc: DocsTocEntry[];
};

export { DocsTocEntry };
