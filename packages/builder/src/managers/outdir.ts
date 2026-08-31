import { access, rm } from "node:fs/promises";
import { join } from "node:path";

import { atomicWrite } from "@/lib/files";

const GENERATED_ENTRIES = ["pages", "manifest.js"];

export async function cleanOutDir(outDir: string): Promise<void> {
  await Promise.all(
    GENERATED_ENTRIES.map((entry) =>
      rm(join(outDir, entry), { recursive: true, force: true }),
    ),
  );
}

export async function prepareOutDir(outDir: string): Promise<void> {
  const gitignorePath = join(outDir, ".gitignore");
  try {
    await access(gitignorePath);
  } catch {
    await atomicWrite(gitignorePath, "*\n");
  }
}
