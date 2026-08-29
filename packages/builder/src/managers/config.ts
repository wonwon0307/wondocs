import { join, relative, resolve } from "node:path";

import type { ResolvedConfig, WonDocsConfig } from "./types";

export class ConfigManager {
  protected config: ResolvedConfig | null;
  private cwd: string;

  constructor() {
    this.config = null;
    this.cwd = process.cwd();
  }

  public setConfig(userConfig: WonDocsConfig): void {
    const contentsDir = userConfig.contentsDir ?? "docs/";

    const resolvedContentsDir = Array.isArray(contentsDir)
      ? contentsDir.map((dir) => this.resolveContentsDir(dir))
      : this.resolveContentsDir(contentsDir);

    this.config = {
      outDir: join(this.cwd, ".wondocs"),
      contentsDir: resolvedContentsDir,
      mdx: userConfig.mdx ?? {},
      autoDetectExternal: userConfig.autoDetectExternal ?? true,
      allowUnlinkedPages: userConfig.allowUnlinkedPages ?? false,
    };
  }

  public getConfig(): ResolvedConfig {
    if (!this.config) {
      throw new Error(
        "Config is not available. Please call setConfig() before calling getConfig().",
      );
    }
    return this.config;
  }

  private resolveContentsDir(dir: string): string {
    const relDir = relative(this.cwd, dir);

    if (!relDir || relDir.startsWith("..")) {
      throw new Error(
        `Invalid contentsDir "${dir}": ` +
          `contentsDir must be a subdirectory of the current working directory ("${this.cwd}").`,
      );
    }

    return resolve(this.cwd, dir);
  }
}
