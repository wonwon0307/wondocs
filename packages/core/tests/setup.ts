import { testItems } from "./data";

vi.mock("node:fs", () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn().mockReturnValue([
    { name: "group1", isDirectory: () => true, isFile: () => false },
    { name: "group2", isDirectory: () => true, isFile: () => false },
  ]),
  readFileSync: vi.fn().mockImplementation((path: string) => {
    if (path.endsWith("meta.json")) {
      return JSON.stringify({
        prefix: "test-prefix",
        items: testItems,
      });
    }
    return "{}";
  }),
}));

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(),
  rename: vi.fn(),
  rm: vi.fn(),
  writeFile: vi.fn(),
}));
