export function relPathToUrl(url: string): string {
  // "/"로 상대 경로를 분리하고
  const parts = url.replace(/\\/g, "/").split("/");

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

// 루트 기준 절대 경로(선행 "/")여야 어느 페이지 깊이에서 navigate하더라도 항상 같은 곳으로 이동한다
export function normalizeUrl(url: string): string {
  const collapsed = url.replace(/\\/g, "/").replace(/\/+/g, "/");
  const withLeadingSlash = collapsed.startsWith("/")
    ? collapsed
    : `/${collapsed}`;

  if (withLeadingSlash === "/") {
    return withLeadingSlash;
  }

  return withLeadingSlash.replace(/\/+$/, "");
}
