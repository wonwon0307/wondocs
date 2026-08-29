import { join, relative, sep } from "node:path";
import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";

import { buildDocs, watchDocs, type WonDocsConfig } from "@wondocs/builder";

const outDir = join(process.cwd(), ".wondocs");

// Turbopack's resolveAlias doesn't support absolute filesystem paths ("server
// relative imports are not implemented yet") — it needs a project-relative
// path, POSIX-separated, with an explicit "./" so it isn't treated as a bare
// specifier.
function toProjectRelative(absolutePath: string): string {
  return `./${relative(process.cwd(), absolutePath).split(sep).join("/")}`;
}

let watchHandle: { close(): void } | null = null;

/**
 * Creates a Next.js config wrapper that builds/watches WonDocs content and
 * wires the generated sidebar/pages modules into Turbopack's resolver.
 *
 * @param wonDocsConfig - WonDocs options (contents directory, MDX plugins, etc).
 * @returns A `withWonDocs` function to wrap your `NextConfig`.
 *
 * @example
 * ```ts
 * // next.config.ts
 * import type { NextConfig } from "next";
 * import { createWonDocs } from "@wondocs/next-plugin";
 *
 * const nextConfig: NextConfig = {
 *   reactCompiler: true,
 * };
 *
 * const withWonDocs = createWonDocs({ contentsDir: "docs/" });
 *
 * export default withWonDocs(nextConfig);
 * ```
 */
export function createWonDocs(wonDocsConfig: WonDocsConfig = {}) {
  return function withWonDocs(nextConfig: NextConfig = {}) {
    // Returns an async function because Turbopack has no plugin API to hook into
    // individual compilations — scanning runs once when next.config is evaluated.
    return async function (phase: string): Promise<NextConfig> {
      if (phase === PHASE_DEVELOPMENT_SERVER) {
        if (watchHandle) watchHandle.close();
        watchHandle = await watchDocs(wonDocsConfig);
      } else if (phase === PHASE_PRODUCTION_BUILD) {
        await buildDocs(wonDocsConfig);
      }

      return {
        ...nextConfig,
        turbopack: {
          ...nextConfig.turbopack,
          resolveAlias: {
            ...nextConfig.turbopack?.resolveAlias,
            "#wondocs/manifest": toProjectRelative(join(outDir, "manifest.js")),
          },
        },
      };
    };
  };
}
