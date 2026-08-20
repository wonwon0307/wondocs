import { readFile } from "node:fs/promises";
import { compile } from "@mdx-js/mdx";
import matter from "gray-matter";

import type { MdxOptions } from "@/config/types";
import type { Frontmatter } from "@/filetree/types";

interface CompileResult {
  js: string;
  frontmatter: Frontmatter;
}

export async function compileMdx(
  filePath: string,
  mdxOptions: MdxOptions = {},
): Promise<CompileResult> {
  // fs API를 사용해서 파일을 읽고
  const raw = await readFile(filePath, "utf-8");

  // 파일 내용을 frontmatter와 content로 분리
  const { data, content } = matter(raw);

  // content는 MDX로 컴파일한다.
  // "program" 형식으로 컴파일해야 import()로 바로 불러올 수 있는 완전한 ES 모듈이 생성된다.
  // ("function-body"는 run()으로 eval해야 하는 함수 본문만 생성하므로, 여기서 쓰면 안 된다)
  const compiled = await compile(content, {
    outputFormat: "program",
    remarkPlugins: mdxOptions.remarkPlugins,
    rehypePlugins: mdxOptions.rehypePlugins,
  });

  return {
    js: String(compiled),
    frontmatter: data as Frontmatter,
  };
}
