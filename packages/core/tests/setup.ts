import { testItems } from "./data";

vi.mock("node:fs", () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn().mockReturnValue([
    { name: "group1", isDirectory: () => true, isFile: () => false },
    { name: "group2", isDirectory: () => true, isFile: () => false },
  ]),
}));
vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(),
  rename: vi.fn(),
  rm: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn().mockResolvedValue([]),
  readFile: vi.fn().mockImplementation((path: string) => {
    if (path.endsWith("meta.json")) {
      return Promise.resolve(
        JSON.stringify({ prefix: "test-prefix", items: testItems }),
      );
    }
    return Promise.resolve("{}");
  }),
}));
vi.mock("@mdx-js/mdx", () => ({
  compile: vi.fn().mockResolvedValue("export default function MDXContent() {}"),
}));
vi.mock("gray-matter", () => ({
  default: vi.fn().mockImplementation((raw: string) => ({
    data: { title: "Test Title" },
    content: raw,
  })),
}));

// mock internal methods for unit testing (exceptions: slug util functions)
vi.mock("@/collection/build", () => ({
  detectCollections: vi.fn().mockReturnValue([
    { key: "group1", path: "/path/to/group1" },
    { key: "group2", path: "/path/to/group2" },
  ]),
}));
vi.mock("@/filetree/build", () => ({
  buildPages: vi.fn().mockResolvedValue({
    "test-leaf": {
      component: () => Promise.resolve("test-leaf-component"),
      meta: { title: "Test Leaf" },
    },
  }),
}));
vi.mock("@/filetree/scan", () => ({
  scanFileTree: vi.fn().mockResolvedValue({
    tree: { "test-leaf": "/path/to/test-leaf.md" },
    hrefs: new Set(["test-prefix/test-leaf"]),
  }),
}));
vi.mock("@/meta/scan", () => ({
  scanMeta: vi.fn().mockResolvedValue({
    prefix: "test-prefix",
    items: [{ type: "link", href: "/test-leaf", label: "Test Leaf" }],
    hrefs: new Set(["test-prefix/test-leaf"]),
  }),
}));
vi.mock("@/utils/files", () => ({
  atomicWrite: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/utils/mdx", () => ({
  compileMdx: vi.fn().mockResolvedValue({
    js: "export default function MDXContent() {}",
    frontmatter: { title: "Test Title" },
  }),
}));
