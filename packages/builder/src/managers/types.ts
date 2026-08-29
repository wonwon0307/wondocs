import type { CompileOptions } from "@mdx-js/mdx";
import type { DocsFrontmatter, DocsPageData } from "@wondocs/core/pages";
import type { DocsItem } from "@wondocs/core/sidebar";

// #region Config Types
// @mdx-js/mdx의 compile()에 그대로 전달되는 remark/rehype plugin 옵션
export type MdxOptions = Pick<
  CompileOptions,
  "remarkPlugins" | "rehypePlugins"
>;

export type WonDocsConfig = {
  /**
   * Contents Directory - where the MDX files are located.
   * A single path is single-group mode; an array of paths is multi-group
   * mode, one collection per path (key derived from the path's basename).
   * @default "docs/"
   */
  contentsDir?: string | string[];
  /**
   * MDX compile options - remark/rehype plugins forwarded to @mdx-js/mdx's compile()
   * @default {}
   */
  mdx?: MdxOptions;
  /**
   * Auto-detect external links in the sidebar items.
   * If true, any link starting with a recognized external protocol
   * (`http://`, `https://`, `mailto:`, `tel:`) will be treated as an
   * external link.
   * @default true
   */
  autoDetectExternal?: boolean;
  /**
   * Allow unlinked pages in the pages directory.
   * If true, pages that are not linked in the sidebar will be allowed.
   * @default false
   */
  allowUnlinkedPages?: boolean;
};

export type ResolvedConfig = Required<WonDocsConfig> & {
  outDir: string;
};
// #endregion

// Manifest Types
export type WonDocsManifest = {
  pages: Record<string, DocsPageData<DocsFrontmatter>>;
  sidebar: Record<string, DocsItem[]>;
};
