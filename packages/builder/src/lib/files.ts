import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
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
      `Error writing file "${filePath}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function parseJsonFile(filePath: string): Promise<unknown> {
  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`Failed to parse JSON file at "${filePath}": ${e}`);
  }
}

export function formatPath(path: PropertyKey[]): string {
  if (path.length === 0) return "(root)";

  const formatString = (p: PropertyKey, i: number) => {
    if (i === 0) return String(p);

    return `.${String(p)}`;
  };

  return path
    .map((p, i) => (typeof p === "number" ? `[${p}]` : formatString(p, i)))
    .join("");
}
