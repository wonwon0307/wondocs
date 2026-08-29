import * as files from "@/lib/files";
import { createSampleMdx } from "@/models/pages/sample";

describe("createSampleMdx", () => {
  it("should create a sample MDX file with the correct content", async () => {
    const collectionDir = "/path/to/collection";

    await createSampleMdx(collectionDir);

    const expectedPath = `${collectionDir}/pages/getting-started.mdx`;
    const expectedContent = `---
title: Getting Started
description: A quick tutorial on how to use WonDocs.
---

# Getting Started with WonDocs

Welcome! This page was generated automatically because your contents directory
was empty.
`;

    expect(files.atomicWrite).toHaveBeenCalledWith(
      expectedPath,
      expect.stringContaining(expectedContent),
    );
  });
});
