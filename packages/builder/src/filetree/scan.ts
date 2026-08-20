import type { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

import { relPathToSlug } from "@/utils/slug";
import type { FileTree, FileTreeScanResult } from "./types";

type EntryKind = "directory" | "meta" | "page";

// entry가 유효한지 검사하고, 유효하지 않으면 던진다. 유효하다면 이후 루프에서
// 어떻게 처리해야 하는지(무시할지, 트리에 추가할지)를 판단할 수 있도록 종류를 반환한다.
function classifyEntry(entry: Dirent, relPath: string): EntryKind {
  // 숨김 파일/디렉토리는 허용하지 않는다. readdir({ recursive: true })는 중첩된 엔트리의
  // entry.name을 base name으로만 주므로, 상위 디렉토리가 숨김인지 확인하려면
  // relPath의 각 경로 세그먼트를 검사해야 한다.
  if (relPath.split("/").some((segment) => segment.startsWith("."))) {
    throw new Error(
      `[WonDocs] Hidden files or directories are not allowed: "${relPath}"`,
    );
  }

  // symlink는 isDirectory()/isFile()이 실제 대상이 아닌 링크 자체의 타입을 반영하므로
  // (즉 디렉토리를 가리키는 symlink여도 isDirectory()는 false), 디렉토리/파일 여부를
  // 신뢰할 수 없다. 허용하지 않고 명시적으로 거부한다.
  if (entry.isSymbolicLink()) {
    throw new Error(`[WonDocs] Symlinks are not allowed: "${relPath}"`);
  }

  if (entry.isDirectory()) return "directory";

  // 소켓, named pipe 등 파일도 디렉토리도 아닌 엔트리는 허용하지 않는다.
  if (!entry.isFile()) {
    throw new Error(`[WonDocs] Unsupported file type: "${relPath}"`);
  }

  if (entry.name === "meta.json") return "meta";

  // .md 또는 .mdx 가 아닌 파일은 허용하지 않는다.
  const ext = entry.name.split(".").pop();
  if (ext !== "md" && ext !== "mdx") {
    throw new Error(
      `[WonDocs] Only .md or .mdx files are allowed: "${relPath}"`,
    );
  }

  return "page";
}

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
    const relPath = relative(dirPath, absPath).replaceAll("\\", "/"); // Windows 경로를 Unix 스타일로 변환

    if (classifyEntry(entry, relPath) !== "page") continue;

    // 상대 경로를 slug로 변환하고, prefix를 접어넣어 트리 키를 만든다.
    // group마다 relPathToSlug만으로 키를 만들면 서로 다른 group의 같은 상대 경로가
    // 충돌하므로, prefix를 포함시켜 sidebar href 공간과 1:1 대응하게 한다.
    const slug = relPathToSlug(relPath);
    const key = prefix ? `${prefix}/${slug}` : slug;

    tree[key] = absPath;
    hrefs.add(`/${key}`);
  }

  return {
    tree,
    hrefs,
  };
}
