import { basename, extname } from "node:path";
import { watch } from "chokidar";

import { buildDocs } from "./build";
import type { ResolvedConfig } from "./config/types";

const DEBOUNCE_MS = 100;

type WatchHandle = {
  close: () => void;
};

export async function watchDocs(config: ResolvedConfig): Promise<WatchHandle> {
  const { contentsDir } = config;

  // 1. Run the initial build
  await buildDocs(config);

  // 2. Set up a debounce timer reference
  let debounceTimer: NodeJS.Timeout | null = null;

  // 3. Start a chokidar watcher on contentsDir, ignoring the initial scan
  const watcher = watch(contentsDir, { ignoreInitial: true });

  // 4. Define a rebuild handler:
  //    - Ignore files that are not .md, .mdx, or meta.json
  //    - Cancel any pending debounce timer
  //    - Schedule a new debounce timer that calls buildDocs — catch and log errors so the watcher stays alive
  const rebuild = (filePath: string) => {
    const ext = extname(filePath);
    if (ext !== ".md" && ext !== ".mdx" && basename(filePath) !== "meta.json")
      return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        await buildDocs(config);
      } catch (error) {
        console.error("[WonDocs]", error);
      }
    }, DEBOUNCE_MS);
  };

  // 5. Register the rebuild handler on add, change, and unlink events
  watcher.on("add", rebuild).on("change", rebuild).on("unlink", rebuild);

  // 6. Return { close() } that cancels the pending timer and closes the watcher
  return {
    close() {
      if (debounceTimer) clearTimeout(debounceTimer);
      watcher.close();
    },
  };
}
