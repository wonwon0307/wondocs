import * as fs from "node:fs/promises";

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
});
