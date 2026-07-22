import type { CompileOptions } from "@mdx-js/mdx";

// @mdx-js/mdx의 compile()에 그대로 전달되는 remark/rehype plugin 옵션
export type MdxOptions = Pick<
  CompileOptions,
  "remarkPlugins" | "rehypePlugins"
>;

export interface WonDocsConfig {
  /**
   * Contents Directory - where the MDX files are located
   * @default "docs/"
   */
  contentsDir?: string;
  /**
   * MDX compile options - remark/rehype plugins forwarded to @mdx-js/mdx's compile()
   * @default {}
   */
  mdx?: MdxOptions;
}

export type ResolvedConfig = Required<WonDocsConfig> & {
  // cwd를 config 로더가 있는 위치에서 로드하여 경로를 일관적이고 정확하게 처리할 수 있도록 root 추가
  root: string;
};
