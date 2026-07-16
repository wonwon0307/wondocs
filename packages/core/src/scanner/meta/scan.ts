import { readFileSync } from "node:fs";

import { MetaFileSchema } from "./schema";
import { type DocsGroup } from "./types";

/**
 * meta.json에서 schema validation에 실패한 경우, 에러 메시지에 표시할 item의 경로를 변환하는 함수
 */
function formatPath(path: PropertyKey[]): string {
  const formatString = (p: PropertyKey, i: number) => {
    if (i === 0) return String(p);

    return `.${String(p)}`;
  };

  return path
    .map((p, i) => (typeof p === "number" ? `[${p}]` : formatString(p, i)))
    .join("");
}

export function scanMeta(filePath: string, key: string): Required<DocsGroup> {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(filePath, "utf-8"));
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
