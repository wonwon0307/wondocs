import { join } from "node:path";

import { detectCollections } from "./collection/build";
import type { ResolvedConfig } from "./config/types";
import { scanMeta } from "./meta/scan";
import { type Item } from "./meta/types";
import { atomicWrite } from "./utils/files";

type Manifest = Record<string, Item[]>;

export async function buildDocs(config: ResolvedConfig): Promise<void> {
  const { root, contentsDir } = config;

  const manifest: Manifest = Object.fromEntries(
    await Promise.all(
      detectCollections(contentsDir).map(async ({ key, path }) => [
        key,
        await scanMeta(join(path, "meta.json"), key),
      ]),
    ),
  );

  const outDir = join(root, ".wondocs");
  await atomicWrite(
    join(outDir, "manifest.js"),
    `export default ${JSON.stringify(manifest, null, 2)};\n`,
  );
}
