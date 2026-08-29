import { access } from "node:fs/promises";
import { join } from "node:path";

import { atomicWrite } from "@/lib/files";

export async function prepareOutDir(outDir: string): Promise<void> {
  const gitignorePath = join(outDir, ".gitignore");
  try {
    await access(gitignorePath);
  } catch {
    await atomicWrite(gitignorePath, "*\n");
  }
}
