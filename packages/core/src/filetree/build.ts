import { join } from "node:path";

import { atomicWrite } from "@/utils/files";
import { compileMdx } from "@/utils/mdx";
import type { FileTree, Frontmatter, PagesManifest } from "./types";

export async function buildPages<T extends Frontmatter>(
  filetree: FileTree,
  outDir: string,
) {
  const pagesData: PagesManifest<T> = {};

  await Promise.all(
    Object.entries(filetree).map(async ([slug, absPath]) => {
      const { js, frontmatter } = await compileMdx(absPath);

      await atomicWrite(join(outDir, "pages", `${slug}.js`), js);
      pagesData[slug] = {
        component: () => import(`./pages/${slug}.js`),
        meta: frontmatter as T,
      };
    }),
  );

  return pagesData;
}
