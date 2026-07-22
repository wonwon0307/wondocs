import { existsSync, mkdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import type { WonDocsConfig, ResolvedConfig } from "./types";

function validateConfig(config: ResolvedConfig) {
  const cwd = process.cwd();

  const resolvedContentsDir = resolve(config.contentsDir);
  const relContentsDir = relative(cwd, resolvedContentsDir);
  if (!relContentsDir || relContentsDir.startsWith("..")) {
    throw new Error(
      `[WonDocs] Invalid contentsDir "${resolvedContentsDir}": ` +
        `contentsDir must be a subdirectory of the current working directory ("${cwd}").`,
    );
  }

  const contentsDir = join(cwd, relContentsDir);
  if (!existsSync(contentsDir)) {
    mkdirSync(contentsDir, { recursive: true });
  }

  return {
    root: cwd,
    contentsDir,
    baseUrl: config.baseUrl,
  };
}

export function loadConfig(config: WonDocsConfig): ResolvedConfig {
  const DEFAULT_CONFIG: ResolvedConfig = {
    root: process.cwd(),
    contentsDir: "docs/",
    baseUrl: "/",
  };

  return validateConfig({ ...DEFAULT_CONFIG, ...config });
}
