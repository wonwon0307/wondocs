export function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+|\/+$/g, "");
}

export function relPathToSlug(relPath: string): string {
  // "/"로 상대 경로를 분리하고
  const parts = relPath.replace(/\\/g, "/").split("/");

  // 마지막 부분을 분석하여, index.md 또는 index.mdx이면, 해당 부분을 제거한다
  const last = parts[parts.length - 1];
  const withoutExt = last.slice(0, last.lastIndexOf("."));

  if (withoutExt === "index") {
    parts.pop();
    return parts.join("/");
  }

  // index가 아니면, 확장자를 제거한 후, slug에 포함시켜 반환한다
  parts[parts.length - 1] = withoutExt;
  return parts.join("/");
}
