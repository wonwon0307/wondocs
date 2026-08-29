import { existsSync } from "node:fs";
import { basename, join } from "node:path";

import { builderContext } from "@/context";
import { MissingMetaJsonError } from "@/lib/errors";
import { parseJsonFile } from "@/lib/files";
import { processSidebarItem } from "./process";
import { MetaFileSchema } from "./schema";
import { type DocsItemInput } from "./types";

export class Meta {
  private path: string;
  private sidebarInput: DocsItemInput[];
  public baseUrl: string;
  public key: string;

  constructor(collectionDir: string) {
    const path = join(collectionDir, "meta.json");
    const name = basename(collectionDir);

    if (!existsSync(path)) {
      throw new MissingMetaJsonError(collectionDir);
    }

    this.path = path;
    this.sidebarInput = [];
    this.baseUrl = name;
    this.key = name;
  }

  public async parse(): Promise<void> {
    // 1. parse
    const raw = await parseJsonFile(this.path);
    const parsed = MetaFileSchema.safeParse(raw);

    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue) => `  ${this.formatPath(issue.path)}: ${issue.message}`)
        .join("\n");
      throw new Error(`Invalid meta.json at "${this.path}":\n${issues}`);
    }

    // sidebar는 무조건 덮어쓴다
    this.sidebarInput = parsed.data.sidebar;

    // baseUrl과 key는 있으면 덮어쓰고, 아니면 둔다
    if (parsed.data.baseUrl) {
      this.baseUrl = parsed.data.baseUrl;
    }
    if (parsed.data.key) {
      this.key = parsed.data.key;
    }

    for (const item of this.sidebarInput) {
      const processedItem = processSidebarItem(item, this.baseUrl);

      // root item은 manifest에 등록한다
      builderContext.manifest.addSidebarItem(this.key, processedItem);
    }
  }

  private formatPath(path: PropertyKey[]): string {
    if (path.length === 0) return "(root)";

    const [first, ...rest] = path;
    return String(first) + rest.map((p) => `[${String(p)}]`).join("");
  }
}
