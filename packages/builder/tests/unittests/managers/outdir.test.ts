import * as fs from "node:fs/promises";

import * as files from "@/lib/files";
import { prepareOutDir } from "@/managers/outdir";

describe("prepareOutDir", () => {
  const outDir = "test-outdir";
  const gitignorePath = `${outDir}/.gitignore`;
  vi.spyOn(files, "atomicWrite").mockResolvedValue();

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should create .gitignore file if it does not exist", async () => {
    // Mock fs.access to throw an error, simulating that the file does not exist
    vi.spyOn(fs, "access").mockRejectedValue(new Error("File does not exist"));

    await prepareOutDir(outDir);

    expect(files.atomicWrite).toHaveBeenCalledWith(gitignorePath, "*\n");
  });

  it("should not create .gitignore file if it already exists", async () => {
    // Mock fs.access to resolve successfully, simulating that the file exists
    vi.spyOn(fs, "access").mockResolvedValue();

    await prepareOutDir(outDir);

    expect(files.atomicWrite).not.toHaveBeenCalled();
  });
});
