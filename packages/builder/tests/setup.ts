vi.mock("node:fs", () => ({
  existsSync: vi.fn().mockReturnValue(true),
  readdirSync: vi.fn().mockReturnValue([
    { name: "meta.json", isFile: () => true, isDirectory: () => false },
    { name: "pages", isFile: () => false, isDirectory: () => true },
  ]),
}));
vi.mock("node:fs/promises", () => ({
  access: vi.fn(),
  mkdir: vi.fn(),
  readFile: vi.fn(),
  rename: vi.fn(),
  rm: vi.fn(),
  writeFile: vi.fn(),
}));
vi.mock("chokidar", () => ({
  watch: vi.fn(),
}));

vi.mock("@/context", () => ({
  builderContext: {
    config: {
      setConfig: vi.fn(),
      getConfig: vi.fn(),
    },
    manifest: {
      reset: vi.fn(),
      checkCollection: vi.fn(),
      addSidebarItem: vi.fn(),
      addPage: vi.fn(),
      writeManifest: vi.fn(),
    },
    urls: {
      reset: vi.fn(),
      addMetaUrl: vi.fn(),
      inspectPagesUrl: vi.fn(),
      validate: vi.fn(),
      report: vi.fn(),
    },
  },
}));
vi.mock("@/lib/files", () => ({
  atomicWrite: vi.fn(),
  parseJsonFile: vi.fn().mockResolvedValue({
    sidebar: [
      "[Test-Link](/test-page)",
      "---",
      "[Test-Index-Link](/subdirectory)",
      "[Test-Child-Link](/subdirectory/test-child-page)",
    ],
    baseUrl: "collection",
    key: "collection",
  }),
}));
vi.mock("@/lib/mdx", () => ({
  compileMdx: vi.fn().mockResolvedValue({
    js: "export default function MDXContent() {}",
    frontmatter: { title: "Test Title" },
  }),
}));
