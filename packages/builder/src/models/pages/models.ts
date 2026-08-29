import { existsSync, readdirSync, type Dirent } from "node:fs";
import { join, relative } from "node:path";

import { builderContext } from "@/context";
import { EmptyPagesDirError } from "@/lib/errors";
import { atomicWrite } from "@/lib/files";
import { compileMdx } from "@/lib/mdx";
import { normalizeUrl, relPathToUrl } from "@/lib/url";

type CandidateEntry = {
  absPath: string;
  url: string;
};

export class Pages {
  private readonly dir: string;
  private readonly entries: Dirent[];
  private readonly candidates: CandidateEntry[]; // .md/.mdx 파일의 relPath 배열

  constructor(collectionDir: string) {
    const dir = join(collectionDir, "pages");
    if (!existsSync(dir)) {
      throw new EmptyPagesDirError(dir);
    }

    const allEntries = readdirSync(dir, {
      withFileTypes: true,
      recursive: true,
    });
    if (allEntries.length === 0) {
      throw new EmptyPagesDirError(dir);
    }

    this.dir = dir;
    this.entries = allEntries;
    this.candidates = [];
  }

  public scan(baseUrl: string): void {
    const ALLOWED_EXTENSIONS = new Set([".mdx", ".md"]);

    for (const entry of this.entries) {
      const absPath = join(entry.parentPath, entry.name);
      const relPath = relative(this.dir, absPath);

      // 숨김 파일/디렉토리는 허용하지 않는다
      const ext = entry.name.split(".").pop();
      if (entry.name.startsWith(".")) {
        throw new Error(
          `Found invalid entry "${relPath}" in ${this.dir}" ` +
            `hidden files or directories (starting with ".") are not allowed.`,
        );
      }

      // 서브 디렉토리는 통과
      if (entry.isDirectory()) {
        continue;
      }

      // .md/.mdx 파일은 추가 검사
      if (entry.isFile() && ALLOWED_EXTENSIONS.has(`.${ext}`)) {
        const normUrl = normalizeUrl(relPathToUrl(relPath));
        const url = normalizeUrl(baseUrl ? `/${baseUrl}${normUrl}` : normUrl);

        builderContext.urls.inspectPagesUrl(url);

        this.candidates.push({
          absPath,
          url,
        });
        continue;
      }

      throw new Error(
        `Found invalid entry "${relPath}" in ${this.dir}" ` +
          `only .md or .mdx files are allowed.`,
      );
    }
  }

  public async compilePages(): Promise<void> {
    const { outDir, mdx } = builderContext.config.getConfig();

    for (const candidate of this.candidates) {
      const { absPath, url } = candidate;
      const { js, frontmatter } = await compileMdx(absPath, mdx);

      const outPath = join(outDir, "pages", `${url}.js`);
      await atomicWrite(outPath, js);

      builderContext.manifest.addPage(url, frontmatter);
    }
  }
}
