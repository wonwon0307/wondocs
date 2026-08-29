import * as fs from "node:fs/promises";

import { atomicWrite, parseJsonFile } from "@/lib/files";

vi.unmock("@/lib/files");

// formatPath will be tested in the Meta class tests

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
      `Error writing file "${filePath}": Write error`,
    );

    expect(fs.rm).toHaveBeenCalledWith(`${filePath}.tmp`, { force: true });
  });

  it("gracefully handles unknown errors", async () => {
    const filePath = "/tmp/test-file.txt";
    const content = "Hello, World!";

    // Simulate an unknown error during writeFile
    vi.spyOn(fs, "writeFile").mockRejectedValueOnce("Unknown error");

    await expect(atomicWrite(filePath, content)).rejects.toThrow(
      `Error writing file "${filePath}": Unknown error`,
    );

    expect(fs.rm).toHaveBeenCalledWith(`${filePath}.tmp`, { force: true });
  });
});

describe("parseJsonFile", () => {
  it("parses a valid JSON file correctly", async () => {
    const filePath = "/tmp/test-file.json";

    const jsonContent = JSON.stringify({ key: "value" });
    vi.spyOn(fs, "readFile").mockResolvedValue(jsonContent);

    const result = await parseJsonFile(filePath);

    expect(result).toEqual({ key: "value" });
  });

  it("throws an error for invalid JSON", async () => {
    const filePath = "/tmp/test-file.json";

    vi.spyOn(fs, "readFile").mockResolvedValue("invalid json");

    await expect(parseJsonFile(filePath)).rejects.toThrow(
      `Failed to parse JSON file at "${filePath}": SyntaxError: Unexpected token 'i', "invalid json" is not valid JSON`,
    );
  });
});
