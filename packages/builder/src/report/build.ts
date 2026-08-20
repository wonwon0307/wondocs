import type { LinkRef } from "@/meta/types";
import type { BuildReport } from "./types";

/**
 * sidebar의 link들과 filetree의 href들을 비교하여 build report를 생성한다.
 * disabled인 link는 "coming soon" 용도로 의도적으로 파일이 없을 수 있으므로
 * broken이 아닌 pending으로 분류한다.
 */
export function computeReport(
  links: LinkRef[],
  filetreeHrefs: Set<string>,
): BuildReport {
  const internal = links.filter((link) => !link.external);
  const internalHrefs = new Set(internal.map((link) => link.href));

  let linked = 0;
  const broken: string[] = [];
  const pending: string[] = [];

  for (const link of internal) {
    if (filetreeHrefs.has(link.href)) {
      linked++;
    } else if (link.disabled) {
      pending.push(link.href);
    } else {
      broken.push(link.href);
    }
  }

  const unlinked = [...filetreeHrefs].filter(
    (href) => !internalHrefs.has(href),
  );

  const localeCompare = (a: string, b: string) => a.localeCompare(b);
  broken.sort(localeCompare);
  pending.sort(localeCompare);
  unlinked.sort(localeCompare);

  return {
    external: links.length - internal.length,
    linked,
    broken,
    pending,
    unlinked,
  };
}

/**
 * report를 출력한다. broken link가 있으면 build를 중단시킨다.
 */
export function printReport(report: BuildReport): void {
  if (report.broken.length > 0) {
    throw new Error(
      `[WonDocs] Broken sidebar links (not found in file tree):\n` +
        report.broken.map((href) => `  - ${href}`).join("\n"),
    );
  }

  console.log(
    `[WonDocs] Build report: ${report.linked} linked, ${report.external} external` +
      (report.pending.length > 0 ? `, ${report.pending.length} pending` : ""),
  );

  if (report.pending.length > 0) {
    console.log(
      `[WonDocs] Pending links (disabled, not yet in file tree):\n` +
        report.pending.map((href) => `  - ${href}`).join("\n"),
    );
  }

  if (report.unlinked.length > 0) {
    console.warn(
      `[WonDocs] Pages not linked from any sidebar:\n` +
        report.unlinked.map((href) => `  - ${href}`).join("\n"),
    );
  }
}
