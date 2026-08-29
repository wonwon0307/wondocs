import { join } from "node:path";

import { atomicWrite } from "@/lib/files";

const SAMPLE_MDX = `---
title: Getting Started
description: A quick tutorial on how to use WonDocs.
---

# Getting Started with WonDocs

Welcome! This page was generated automatically because your contents directory
was empty.

WonDocs turns Markdown/MDX files into a documentation site:

1. Edit or delete this file (\`getting-started.mdx\`) to start writing your own docs.
2. Add sidebar entries by editing \`meta.json\` next to this file.
3. Each entry in \`meta.json\` needs a \`url\` that matches the slug of an
   \`.mdx\` file in this directory (e.g. \`/getting-started\` -> \`getting-started.mdx\`).

Save any \`.md\`/\`.mdx\` file or \`meta.json\` while the dev server is running and
WonDocs will rebuild the sidebar and pages automatically.
`;

export async function createSampleMdx(collectionDir: string): Promise<void> {
  const path = join(collectionDir, "pages", "getting-started.mdx");
  await atomicWrite(path, SAMPLE_MDX);
}
