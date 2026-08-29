import * as files from "@/lib/files";
import { createSampleMetaJson } from "@/models/meta/sample";

describe("createSampleMetaJson", () => {
  it("should create a sample meta.json file with the correct content", async () => {
    const collectionDir = "/path/to/collection";

    await createSampleMetaJson(collectionDir);

    const expectedPath = `${collectionDir}/meta.json`;
    const expectedContent =
      JSON.stringify(
        {
          sidebar: [
            {
              type: "link",
              url: "/getting-started",
              label: "Getting Started",
            },
          ],
        },
        null,
        2,
      ) + "\n";

    expect(files.atomicWrite).toHaveBeenCalledWith(
      expectedPath,
      expectedContent,
    );
  });
});
