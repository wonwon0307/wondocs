import * as fs from "node:fs/promises";
import * as mdxCompiler from "@mdx-js/mdx";

import { compileMdx } from "@/lib/mdx";

vi.unmock("@/lib/mdx");

vi.mock("@mdx-js/mdx", () => ({
  compile: vi.fn().mockResolvedValue({
    data: { toc: [] },
    toString: () => "export default function MDXContent() {}",
  }),
}));
vi.mock("gray-matter", () => ({
  default: vi.fn().mockImplementation((raw: string) => ({
    data: { title: "Test Title" },
    content: raw,
  })),
}));

describe("compileMdx", () => {
  it("returns compiled js and frontmatter correctly", async () => {
    vi.spyOn(fs, "readFile").mockResolvedValue("# Test MDX Content");

    const result = await compileMdx("test.mdx");

    expect(result).toEqual({
      js: "export default function MDXContent() {}",
      frontmatter: { title: "Test Title" },
      toc: [],
    });
  });

  it("compiles with outputFormat 'program' so pages are import()-able", async () => {
    vi.spyOn(fs, "readFile").mockResolvedValue("# Test MDX Content");

    await compileMdx("test.mdx");

    expect(mdxCompiler.compile).toHaveBeenCalledWith(
      "# Test MDX Content",
      expect.objectContaining({ outputFormat: "program" }),
    );
  });

  it("forwards remark/rehype plugins to compile()", async () => {
    vi.spyOn(fs, "readFile").mockResolvedValue("# Test MDX Content");
    const remarkPlugin = () => {};
    const rehypePlugin = () => {};

    await compileMdx("test.mdx", {
      remarkPlugins: [remarkPlugin],
      rehypePlugins: [rehypePlugin],
    });

    expect(mdxCompiler.compile).toHaveBeenCalledWith(
      "# Test MDX Content",
      expect.objectContaining({
        remarkPlugins: [remarkPlugin],
        rehypePlugins: [rehypePlugin],
      }),
    );
  });
});
