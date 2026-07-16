import { join } from "node:path";
import type { NextConfig } from "next";
import { loadConfig, type WonDocsConfig } from "@wondocs/core/config";
import { Scanner } from "@wondocs/core/scanner";

const MANIFEST_MODULE_ID = "#wondocs/manifest";
const getManifestPath = () => join(process.cwd(), ".wondocs", "manifest.js");

export function withWonDocs(wonDocsConfig: WonDocsConfig = {}) {
  // Returns an async function because Turbopack has no plugin API to hook into
  // individual compilations — scanning runs once when next.config is evaluated.
  return async function (nextConfig: NextConfig = {}): Promise<NextConfig> {
    const resolvedConfig = loadConfig(wonDocsConfig);
    const scanner = new Scanner(resolvedConfig);
    await scanner.scan();

    const manifestPath = getManifestPath();

    return {
      ...nextConfig,
      turbopack: {
        ...nextConfig.turbopack,
        resolveAlias: {
          ...nextConfig.turbopack?.resolveAlias,
          [MANIFEST_MODULE_ID]: manifestPath,
        },
      },
    };
  };
}
