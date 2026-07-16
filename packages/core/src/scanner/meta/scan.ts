import { readFile } from "node:fs/promises";

import { MetaFileSchema } from "./schema";
import { type DocsGroup } from "./types";

/**
 * meta.json에서 schema validation에 실패한 경우, 에러 메시지에 표시할 item의 경로를 변환하는 함수
 */
function formatPath(path: PropertyKey[]): string {
  if (path.length === 0) return "(root)";

  const formatString = (p: PropertyKey, i: number) => {
    if (i === 0) return String(p);

    return `.${String(p)}`;
  };

  return path
    .map((p, i) => (typeof p === "number" ? `[${p}]` : formatString(p, i)))
    .join("");
}

export async function scanMeta(
  filePath: string,
  key: string,
): Promise<Required<DocsGroup>> {
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(filePath, "utf-8"));
  } catch (e) {
    throw new Error(
      `[WonDocs] Failed to parse meta.json at "${filePath}": ${e}`,
    );
  }

  const result = MetaFileSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${formatPath(issue.path)}: ${issue.message}`)
      .join("\n");
    throw new Error(`[WonDocs] Invalid meta.json at "${filePath}":\n${issues}`);
  }

  return {
    prefix: result.data.prefix ?? key,
    items: result.data.items,
  };
}
