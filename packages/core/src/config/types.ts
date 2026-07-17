export interface WonDocsConfig {
  /**
   * Contents Directory - where the MDX files are located
   * @default "docs/"
   */
  contentsDir?: string;
  /**
   * Base URL - the base URL for all links in the generated sidebar (e.g. if your docs are served from "/docs", set this to "/docs")
   * @default "/"
   */
  baseUrl?: string;
}

export type ResolvedConfig = Required<WonDocsConfig> & {
  // cwd를 config 로더가 있는 위치에서 로드하여 경로를 일관적이고 정확하게 처리할 수 있도록 root 추가
  root: string;
};
