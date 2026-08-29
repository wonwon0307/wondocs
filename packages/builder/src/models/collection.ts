import { existsSync, readdirSync } from "node:fs";

import { builderContext } from "@/context";
import { EmptyCollectionError } from "@/lib/errors";
import { Meta } from "./meta/models";
import { Pages } from "./pages/models";

export class Collection {
  private meta: Meta;
  private pages: Pages;

  constructor(dir: string) {
    // 검증 먼저 수행하고
    if (!existsSync(dir)) {
      throw new EmptyCollectionError(dir);
    }
    const rootEntries = readdirSync(dir, { withFileTypes: true });
    if (rootEntries.length === 0) {
      throw new EmptyCollectionError(dir);
    }

    // 문제 없으면 필드 초기화
    this.meta = new Meta(dir);
    this.pages = new Pages(dir);

    if (rootEntries.length !== 2) {
      throw new Error(
        `Invalid collection directory "${dir}": ` +
          `a collection must contain exactly 2 entries: "meta.json" and "pages" directory.`,
      );
    }
  }

  public async scan(): Promise<void> {
    await this.meta.parse();

    builderContext.manifest.checkCollection(this.meta.key, this.meta.baseUrl);

    this.pages.scan(this.meta.baseUrl);
  }

  public async compilePages(): Promise<void> {
    await this.pages.compilePages();
  }
}
