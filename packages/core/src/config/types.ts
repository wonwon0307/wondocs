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

export type ResolvedConfig = Required<WonDocsConfig>;
