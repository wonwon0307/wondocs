import { builderContext } from "./context";
import { prepareOutDir } from "./managers/outdir";
import type { WonDocsConfig } from "./managers/types";
import { Collection } from "./models/collection";

export async function buildDocs(config: WonDocsConfig): Promise<void> {
  try {
    builderContext.config.setConfig(config);

    const { contentsDir, outDir, allowUnlinkedPages } =
      builderContext.config.getConfig();

    const collections: Collection[] = Array.isArray(contentsDir)
      ? contentsDir.map((dir) => new Collection(dir))
      : [new Collection(contentsDir)];

    builderContext.manifest.reset();
    builderContext.urls.reset();
    await Promise.all(collections.map((collection) => collection.scan()));

    builderContext.urls.validate(allowUnlinkedPages);

    await prepareOutDir(outDir);

    await Promise.all(
      collections.map((collection) => collection.compilePages()),
    );

    await builderContext.manifest.writeManifest(outDir);
    builderContext.urls.report();
  } catch (error) {
    console.error("[WonDocs] Error during build:", error);
    throw error;
  }
}
