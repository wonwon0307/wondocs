import { join } from "node:path";
import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";

import { loadConfig, type WonDocsConfig } from "@wondocs/core/config";
import { buildDocs } from "@wondocs/core/build";
import { watchDocs } from "@wondocs/core/watch";

const outDir = join(process.cwd(), ".wondocs");

let watchHandle: { close(): void } | null = null;

export function createWonDocs(wonDocsConfig: WonDocsConfig = {}) {
  return function withWonDocs(nextConfig: NextConfig = {}) {
    // Returns an async function because Turbopack has no plugin API to hook into
    // individual compilations — scanning runs once when next.config is evaluated.
    return async function (phase: string): Promise<NextConfig> {
      const resolvedConfig = loadConfig(wonDocsConfig);
      const shouldWatch =
        phase === PHASE_DEVELOPMENT_SERVER || process.argv.includes("--watch");
      const shouldBuild = phase === PHASE_PRODUCTION_BUILD;

      // next.config is also evaluated on `next start` (PHASE_PRODUCTION_SERVER) and other
      // non-build phases — skip there so we don't re-scan/recompile docs (and re-write
      // .wondocs/) on every server boot, which can also fail on read-only production filesystems.
      if (shouldWatch) {
        if (watchHandle) watchHandle.close();
        watchHandle = await watchDocs(resolvedConfig);
      } else if (shouldBuild) {
        await buildDocs(resolvedConfig);
      }

      return {
        ...nextConfig,
        turbopack: {
          ...nextConfig.turbopack,
          resolveAlias: {
            ...nextConfig.turbopack?.resolveAlias,
            "#wondocs/sidebar": join(outDir, "sidebar.js"),
            "#wondocs/pages": join(outDir, "pages.js"),
          },
        },
      };
    };
  };
}
