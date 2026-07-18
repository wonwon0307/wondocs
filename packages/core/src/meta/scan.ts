import { readFile } from "node:fs/promises";

import { MetaFileSchema } from "./schema";
import type { Item, MetaScanResult } from "./types";

// meta.json에서 schema validation에 실패한 경우, 에러 메시지에 표시할 item의 경로를 변환하는 함수
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
): Promise<MetaScanResult> {
  let raw: unknown;

  // meta.json 파일을 읽고 JSON을 파싱한다
  try {
    raw = JSON.parse(await readFile(filePath, "utf-8"));
  } catch (e) {
    throw new Error(
      `[WonDocs] Failed to parse meta.json at "${filePath}": ${e}`,
    );
  }

  // meta.json의 schame validation을 수행한다
  const result = MetaFileSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${formatPath(issue.path)}: ${issue.message}`)
      .join("\n");
    throw new Error(`[WonDocs] Invalid meta.json at "${filePath}":\n${issues}`);
  }

  // 통과했다면, href를 처리
  const hrefs = new Set<string>();
  const prefix = result.data.prefix ?? key;

  // item 1개 처리하는 함수: external flag가 있으면, 그대로 반환하고, 그렇지 않으면 prefix를 붙인다
  const processItem = (item: Item) => {
    if (item.type === "link") {
      if (!item.external) {
        item.href = `${prefix}${item.href}`;
      }
      hrefs.add(item.href);
    } else if (item.type === "group") {
      item.items.forEach(processItem);
    }
  };

  result.data.items.forEach(processItem);

  return {
    items: result.data.items,
    hrefs,
  };
}
