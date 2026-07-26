import { readdirSync } from "node:fs";
import { join } from "node:path";

import { atomicWrite } from "@/utils/files";

const SAMPLE_META_JSON = `${JSON.stringify(
  {
    items: [
      {
        type: "link",
        href: "/getting-started",
        label: "Getting Started",
      },
    ],
  },
  null,
  2,
)}\n`;

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
3. Each entry in \`meta.json\` needs an \`href\` that matches the slug of an
   \`.mdx\` file in this directory (e.g. \`/getting-started\` -> \`getting-started.mdx\`).

Save any \`.md\`/\`.mdx\` file or \`meta.json\` while the dev server is running and
WonDocs will rebuild the sidebar and pages automatically.
`;

/**
 * If `contentsDir` is completely empty, scaffolds a minimal single-collection
 * setup — one root `meta.json` with a sample link, and a matching tutorial
 * `.mdx` page — so a fresh project doesn't immediately fail with "missing
 * meta.json" errors the first time watch mode runs.
 *
 * Does nothing if `contentsDir` already has any entries; existing
 * misconfigurations (stray files, subdirectories without meta.json, etc.)
 * are left for `detectCollections` to report.
 *
 * @param contentsDir - Absolute path to the docs contents directory.
 * @returns Whether sample docs were scaffolded.
 */
export async function scaffoldSampleDocs(
  contentsDir: string,
): Promise<boolean> {
  const entries = readdirSync(contentsDir);
  if (entries.length > 0) return false;

  await Promise.all([
    atomicWrite(join(contentsDir, "meta.json"), SAMPLE_META_JSON),
    atomicWrite(join(contentsDir, "getting-started.mdx"), SAMPLE_MDX),
  ]);

  console.log(
    `[WonDocs] "${contentsDir}" was empty — created a sample meta.json and getting-started.mdx to get you started.`,
  );
  console.log(
    `[WonDocs] To use multiple collections, create subdirectories under "${contentsDir}" ` +
      `(each with its own meta.json), and remove the meta.json at the contents root.`,
  );

  return true;
}
