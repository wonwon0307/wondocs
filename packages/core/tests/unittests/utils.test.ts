import * as fs from "node:fs/promises";
import * as mdxCompiler from "@mdx-js/mdx";

import { atomicWrite } from "@/utils/files";
import { compileMdx } from "@/utils/mdx";

vi.unmock("@/utils/files");
vi.unmock("@/utils/mdx");

describe("atomicWrite", () => {
  it("writes content to a file atomically", async () => {
    const filePath = "/tmp/test-file.txt";
    const content = "Hello, World!";

    await atomicWrite(filePath, content);

    expect(fs.writeFile).toHaveBeenCalledOnce();
  });

  it("cleans up temporary file on error", async () => {
    const filePath = "/tmp/test-file.txt";
    const content = "Hello, World!";

    // Simulate an error during writeFile
    vi.spyOn(fs, "writeFile").mockRejectedValueOnce(new Error("Write error"));

    await expect(atomicWrite(filePath, content)).rejects.toThrow(
      `[WonDocs] Error writing file "${filePath}": Write error`,
    );

    expect(fs.rm).toHaveBeenCalledWith(`${filePath}.tmp`, { force: true });
  });

  it("gracefully handles unknown errors", async () => {
    const filePath = "/tmp/test-file.txt";
    const content = "Hello, World!";

    // Simulate an unknown error during writeFile
    vi.spyOn(fs, "writeFile").mockRejectedValueOnce("Unknown error");

    await expect(atomicWrite(filePath, content)).rejects.toThrow(
      `[WonDocs] Error writing file "${filePath}": Unknown error`,
    );

    expect(fs.rm).toHaveBeenCalledWith(`${filePath}.tmp`, { force: true });
  });
});

describe("compileMdx", () => {
  it("returns compiled js and frontmatter correctly", async () => {
    vi.spyOn(fs, "readFile").mockResolvedValue("# Test MDX Content");

    const result = await compileMdx("test.mdx");

    expect(result).toEqual({
      js: "export default function MDXContent() {}",
      frontmatter: { title: "Test Title" },
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
