import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import type { CollectionEntry } from "./types";

export function detectCollections(contentsDir: string): CollectionEntry[] {
  // root에 meta.json이 있으면 single-group 모드, 곧바로 반환
  if (existsSync(join(contentsDir, "meta.json"))) {
    return [{ key: "", path: contentsDir }];
  }

  // 그렇지 않으면 multi-group 모드
  const entries = readdirSync(contentsDir, { withFileTypes: true });

  // root에 파일이 있으면 에러
  const files = entries.filter((e) => e.isFile());
  if (files.length > 0) {
    throw new Error(
      `[WonDocs] contentsDir "${contentsDir}" contains files at its root but no meta.json — ` +
        `either add a meta.json for single-group mode, or remove root-level files for multi-group mode. ` +
        `Found: ${files.map((f) => f.name).join(", ")}`,
    );
  }

  // root에 디렉토리가 없으면 에러
  const dirs = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith("."),
  );
  if (dirs.length === 0) {
    throw new Error(
      `[WonDocs] contentsDir "${contentsDir}" is empty. Add a meta.json (single-group) or subdirectories with meta.json files (multi-group).`,
    );
  }

  // meta.json이 없는 서브디렉토리가 있으면 에러
  const missingMeta = dirs.filter(
    (d) => !existsSync(join(contentsDir, d.name, "meta.json")),
  );
  if (missingMeta.length > 0) {
    throw new Error(
      `[WonDocs] The following group directories are missing a meta.json: ` +
        missingMeta.map((d) => `"${d.name}"`).join(", "),
    );
  }

  // 모든 조건을 통과하면 그룹 엔트리 반환
  return dirs.map((d) => ({ key: d.name, path: join(contentsDir, d.name) }));
}
