import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function atomicWrite(
  filePath: string,
  content: string,
): Promise<void> {
  const tempFilePath = `${filePath}.tmp`;

  try {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(tempFilePath, content, "utf-8");
    await rename(tempFilePath, filePath);
  } catch (error) {
    await rm(tempFilePath, { force: true });
    throw new Error(
      `[WonDocs] Error writing file "${filePath}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
