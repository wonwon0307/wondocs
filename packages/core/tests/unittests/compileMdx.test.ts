import * as fs from "node:fs/promises";

import { compileMdx } from "@/utils/mdx";

vi.mock("@mdx-js/mdx", () => ({
  compile: vi.fn().mockResolvedValue("export default function MDXContent() {}"),
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
    });
  });
});
