export class UrlManager {
  private readonly metaUrls: Set<string>;
  private readonly pagesUrls: Set<string>;
  private readonly brokenUrls: Set<string>; // meta.json에만 있는 url들
  private readonly unlinkedUrls: Set<string>; // pages에서 나온 url 중 meta.json에 없는 url

  // duplicates
  private readonly metaDuplicates: Set<string>;
  private readonly pagesDuplicates: Set<string>;

  // stats
  private numLinked: number;

  constructor() {
    this.metaUrls = new Set<string>();
    this.pagesUrls = new Set<string>();
    this.brokenUrls = new Set<string>();
    this.unlinkedUrls = new Set<string>();

    this.metaDuplicates = new Set<string>();
    this.pagesDuplicates = new Set<string>();
    this.numLinked = 0;
  }

  public reset(): void {
    this.metaUrls.clear();
    this.pagesUrls.clear();
    this.brokenUrls.clear();
    this.unlinkedUrls.clear();

    this.metaDuplicates.clear();
    this.pagesDuplicates.clear();
    this.numLinked = 0;
  }

  public addMetaUrl(url: string): void {
    if (this.metaUrls.has(url)) {
      this.metaDuplicates.add(url);
    } else {
      this.metaUrls.add(url);
      this.brokenUrls.add(url);
    }
  }

  public inspectPagesUrl(url: string): void {
    if (!this.metaUrls.has(url)) {
      this.unlinkedUrls.add(url);
    } else {
      this.brokenUrls.delete(url);
      this.numLinked++;
    }

    if (this.pagesUrls.has(url)) {
      this.pagesDuplicates.add(url);
    } else {
      this.pagesUrls.add(url);
    }
  }

  public validate(allowUnlinkedPages: boolean): void {
    if (this.brokenUrls.size > 0) {
      throw new Error(
        `Broken Links detected: ${this.brokenUrls.size} URLs in meta.json do not have corresponding pages. ` +
          Array.from(this.brokenUrls),
      );
    }

    if (this.unlinkedUrls.size > 0 && !allowUnlinkedPages) {
      throw new Error(
        `Found ${this.unlinkedUrls.size} unexpected unlinked pages in the pages directory: ` +
          `${Array.from(this.unlinkedUrls).join(", ")}. ` +
          `To allow unlinked pages, set "allowUnlinkedPages" to true in the config.`,
      );
    }

    if (this.pagesDuplicates.size > 0) {
      throw new Error(
        `Found ${this.pagesDuplicates.size} duplicate URLs in the pages directory: ` +
          `${Array.from(this.pagesDuplicates).join(", ")}`,
      );
    }
  }

  public report(): void {
    console.log(
      `[WonDocs] Build report: Successfully linked ${this.numLinked} URLs ` +
        `out of ${this.metaUrls.size} in the sidebar.`,
    );

    if (this.unlinkedUrls.size > 0) {
      console.log(
        `[WonDocs] Found ${this.unlinkedUrls.size} unlinked pages in the pages directory: ` +
          `${Array.from(this.unlinkedUrls).join(", ")}`,
      );
    }

    if (this.metaDuplicates.size > 0) {
      console.warn(
        `[WonDocs] Found ${this.metaDuplicates.size} duplicate URLs in the meta.json: ` +
          `${Array.from(this.metaDuplicates).join(", ")}`,
      );
    }
  }
}
