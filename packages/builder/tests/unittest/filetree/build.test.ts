import { buildPages } from "@/filetree/build";

import { testTree } from "../../data";
import { atomicWrite } from "@/utils/files";

vi.unmock("@/filetree/build");

describe("buildPages", () => {
  const outDir = "/path/to/output";

  it("should build pages and return the correct pages manifest", async () => {
    const result = await buildPages(testTree, outDir);

    expect(result).toEqual({
      "test-leaf": {
        component: expect.any(Function),
        meta: { title: "Test Title" },
      },
      "test-group/test-child-leaf": {
        component: expect.any(Function),
        meta: { title: "Test Title" },
      },
    });
    expect(atomicWrite).toHaveBeenCalledTimes(2);
  });

  it("COVERAGE PURPOSE: call component API", async () => {
    const result = await buildPages(testTree, outDir);

    await expect(result["test-leaf"].component()).rejects.toThrow();
  });
});
