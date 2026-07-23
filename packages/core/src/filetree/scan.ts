import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

import { relPathToSlug } from "@/utils/slug";
import type { FileTree, FileTreeScanResult } from "./types";

/**
 * filetree를 분석하여 파일과 디렉토리의 구조를 나타내는 트리를 생성하여 반환한다
 */
export async function scanFileTree(
  dirPath: string,
  prefix: string,
): Promise<FileTreeScanResult> {
  // readdir를 사용하여 디렉토리 내의 모든 파일과 디렉토리를 가져옴
  const entries = await readdir(dirPath, {
    withFileTypes: true,
    recursive: true,
  });
  const tree: FileTree = {};
  const hrefs = new Set<string>();

  // 각 엔트리를 순회하며 파일트리 구성
  for (const entry of entries) {
    const absPath = join(entry.parentPath, entry.name); // filetree 안에서는 디렉토리 depth에 제한이 없다
    const relPath = relative(dirPath, absPath).replace(/\\/g, "/"); // Windows 경로를 Unix 스타일로 변환

    // 숨김 파일/디렉토리는 허용하지 않는다.
    if (entry.name.startsWith(".")) {
      throw new Error(
        `[WonDocs] Hidden files or directories are not allowed: "${relPath}"`,
      );
    }

    // 서브디렉토리가 있을 수 있으니, error를 던지지는 않지만, 엔트리를 분석하지 않고 무시한다
    if (entry.isDirectory()) continue;

    // meta.json은 무시한다
    if (entry.name === "meta.json") continue;

    // .md 또는 .mdx 가 아닌 파일은 허용하지 않는다.
    const ext = entry.name.split(".").pop();
    if (ext !== "md" && ext !== "mdx") {
      throw new Error(
        `[WonDocs] Only .md or .mdx files are allowed: "${relPath}"`,
      );
    }

    // 상대 경로를 slug로 변환하여 트리에 추가
    tree[relPathToSlug(relPath)] = absPath;
    hrefs.add(`${prefix}/${relPathToSlug(relPath)}`);
  }

  return {
    tree,
    hrefs,
  };
}
