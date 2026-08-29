import { extname } from "node:path";
import { watch } from "chokidar";

import { builderContext } from "./context";
import {
  EmptyCollectionError,
  EmptyPagesDirError,
  MissingMetaJsonError,
} from "./lib/errors";
import { prepareOutDir } from "./managers/outdir";
import type { WonDocsConfig } from "./managers/types";
import { Collection } from "./models/collection";
import { createSampleMetaJson } from "./models/meta/sample";
import { createSampleMdx } from "./models/pages/sample";

const DEBOUNCE_MS = 100;
// 2. Debounce 타이머 초기화
let debounceTimer: NodeJS.Timeout | null = null;

export type WatchHandle = {
  close: () => void;
};

export async function watchDocs(config: WonDocsConfig): Promise<WatchHandle> {
  builderContext.config.setConfig(config);

  const { contentsDir } = builderContext.config.getConfig();

  // 1. 초기 빌드 수행. 초기 빌드 에러는 별도 처리하지 않고 그대로 throw
  await build();

  // 2. Watcher 시작
  const watcher = watch(contentsDir, { ignoreInitial: true });
  watcher.on("add", rebuild).on("change", rebuild).on("unlink", rebuild);

  return {
    close() {
      if (debounceTimer) clearTimeout(debounceTimer);
      watcher.close();
    },
  };
}

async function build(): Promise<void> {
  const { contentsDir, outDir, allowUnlinkedPages } =
    builderContext.config.getConfig();

  const collections: Collection[] = Array.isArray(contentsDir)
    ? await Promise.all(contentsDir.map((dir) => resolveCollectionDir(dir)))
    : [await resolveCollectionDir(contentsDir)];

  builderContext.manifest.reset();
  builderContext.urls.reset();
  await Promise.all(collections.map((collection) => collection.scan()));

  builderContext.urls.validate(allowUnlinkedPages);

  await prepareOutDir(outDir);

  await Promise.all(collections.map((collection) => collection.compilePages()));

  await builderContext.manifest.writeManifest(outDir);
  builderContext.urls.report();
}

function rebuild(filePath: string): void {
  const ext = extname(filePath);

  if (ext !== ".md" && ext !== ".mdx" && !filePath.endsWith("meta.json")) {
    return;
  }

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      await build();
    } catch (error) {
      console.error("[WonDocs] Error during watch:", error);
    }
  }, DEBOUNCE_MS);
}

async function resolveCollectionDir(contentsDir: string): Promise<Collection> {
  try {
    return new Collection(contentsDir);
  } catch (e: unknown) {
    if (e instanceof EmptyCollectionError) {
      await createSampleMdx(contentsDir);
      await createSampleMetaJson(contentsDir);

      console.log(
        `[WonDocs] Collection "${contentsDir}" is empty.` +
          `Created a sample meta.json and getting-started.mdx to get you started.`,
      );

      return new Collection(contentsDir);
    }
    if (e instanceof EmptyPagesDirError) {
      await createSampleMdx(contentsDir);

      console.log(
        `[WonDocs] Missing the pages directory in "${contentsDir}".` +
          `Created the sample getting-started.mdx to get you started.`,
      );

      return new Collection(contentsDir);
    }
    if (e instanceof MissingMetaJsonError) {
      await createSampleMetaJson(contentsDir);

      console.log(
        `[WonDocs] Missing meta.json in "${contentsDir}".` +
          `Created a sample meta.json to get you started.`,
      );

      return new Collection(contentsDir);
    }

    throw e;
  }
}
