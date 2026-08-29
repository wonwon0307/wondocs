import { join } from "node:path";

import { atomicWrite } from "@/lib/files";

const SAMPLE_META_JSON = `${JSON.stringify(
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
)}\n`;

export async function createSampleMetaJson(
  collectionDir: string,
): Promise<void> {
  const path = join(collectionDir, "meta.json");
  await atomicWrite(path, SAMPLE_META_JSON);
}
