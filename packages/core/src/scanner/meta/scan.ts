import { readFileSync } from "node:fs";

import { MetaFileSchema } from "./schema";
import { type DocsGroup } from "./types";

function formatPath(path: PropertyKey[]): string {
  return path
    .map((p, i) =>
      typeof p === "number" ? `[${p}]` : i === 0 ? String(p) : `.${String(p)}`,
    )
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
