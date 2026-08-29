import { UrlManager } from "@/managers/urls";

describe("UrlManager", () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});

  const manager = new UrlManager();

  it("should check and report URLs correctly", () => {
    manager.addMetaUrl("/page1");
    manager.addMetaUrl("/page2");
    manager.inspectPagesUrl("/page1");
    manager.inspectPagesUrl("/page2");

    expect(() => manager.validate(false)).not.toThrow();

    manager.report();

    expect(console.log).toHaveBeenCalledWith(
      "[WonDocs] Build report: Successfully linked 2 URLs out of 2 in the sidebar.",
    );
  });

  it("should raise an error for broken links", () => {
    manager.addMetaUrl("/page3");

    expect(() => manager.validate(false)).toThrow(
      "Broken Links detected: 1 URLs in meta.json do not have corresponding pages. /page3",
    );
  });

  it("should raise an error for unlinked pages when not allowed", () => {
    manager.inspectPagesUrl("/page3"); // add page3 to pass broken urls check
    manager.inspectPagesUrl("/page4");

    expect(() => manager.validate(false)).toThrow(
      'Found 1 unexpected unlinked pages in the pages directory: /page4. To allow unlinked pages, set "allowUnlinkedPages" to true in the config.',
    );
  });

  it("handles reset correctly and should raise an error for duplicate pages", () => {
    manager.reset();

    // check reset state
    manager.report();
    expect(console.log).toHaveBeenCalledWith(
      "[WonDocs] Build report: Successfully linked 0 URLs out of 0 in the sidebar.",
    );
    manager.addMetaUrl("/page1");
    manager.inspectPagesUrl("/page1");
    manager.inspectPagesUrl("/page1"); // duplicate page

    expect(() => manager.validate(false)).toThrow(
      "Found 1 duplicate URLs in the pages directory: /page1",
    );
  });

  it("should allow unlinked pages when allowed", () => {
    manager.reset();
    manager.addMetaUrl("/page1");
    manager.inspectPagesUrl("/page1");
    manager.inspectPagesUrl("/page2"); // unlinked page

    expect(() => manager.validate(true)).not.toThrow();

    manager.report();

    expect(console.log).toHaveBeenCalledWith(
      "[WonDocs] Build report: Successfully linked 1 URLs out of 1 in the sidebar.",
    );
    expect(console.log).toHaveBeenCalledWith(
      "[WonDocs] Found 1 unlinked pages in the pages directory: /page2",
    );
  });

  it("should not raise an error for meta duplicates, but should warn in the report", () => {
    manager.reset();
    manager.addMetaUrl("/page1");
    manager.addMetaUrl("/page1"); // duplicate meta url
    manager.inspectPagesUrl("/page1");

    expect(() => manager.validate(false)).not.toThrow();

    manager.report();

    expect(console.log).toHaveBeenCalledWith(
      "[WonDocs] Build report: Successfully linked 1 URLs out of 1 in the sidebar.",
    );
    expect(console.warn).toHaveBeenCalledWith(
      "[WonDocs] Found 1 duplicate URLs in the meta.json: /page1",
    );
  });
});
