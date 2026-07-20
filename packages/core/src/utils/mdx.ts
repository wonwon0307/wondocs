import { readFile } from "node:fs/promises";
import { compile } from "@mdx-js/mdx";
import matter from "gray-matter";

import type { Frontmatter } from "@/filetree/types";

interface CompileResult {
  js: string;
  frontmatter: Frontmatter;
}

export async function compileMdx(filePath: string): Promise<CompileResult> {
  // fs API를 사용해서 파일을 읽고
  const raw = await readFile(filePath, "utf-8");

  // 파일 내용을 frontmatter와 content로 분리
  const { data, content } = matter(raw);

  // content는 MDX로 컴파일
  const compiled = await compile(content, {
    outputFormat: "function-body",
  });

  return {
    js: String(compiled),
    frontmatter: data as Frontmatter,
  };
}
