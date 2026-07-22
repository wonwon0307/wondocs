import { join } from "node:path";

import type { MdxOptions } from "@/config/types";
import { atomicWrite } from "@/utils/files";
import { compileMdx } from "@/utils/mdx";
import type { FileTree, Frontmatter, PagesManifest } from "./types";

export async function buildPages<T extends Frontmatter>(
  filetree: FileTree,
  outDir: string,
  mdxOptions: MdxOptions = {},
) {
  const pagesData: PagesManifest<T> = {};

  await Promise.all(
    Object.entries(filetree).map(async ([slug, absPath]) => {
      const { js, frontmatter } = await compileMdx(absPath, mdxOptions);

      await atomicWrite(join(outDir, "pages", `${slug}.js`), js);
      pagesData[slug] = {
        component: () => import(`./pages/${slug}.js`),
        meta: frontmatter as T,
      };
    }),
  );

  return pagesData;
}
