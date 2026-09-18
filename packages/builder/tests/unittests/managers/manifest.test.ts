import * as files from "@/lib/files";
import { ManifestManager } from "@/managers/manifest";

class TestManifestManager extends ManifestManager {
  public getManifest() {
    return this.manifest;
  }
}

describe("ManifestManager", () => {
  const manager = new TestManifestManager();

  it("should add pages and sidebar items and resets correctly", () => {
    manager.addPage("/page1", { title: "Page 1" }, []);
    manager.addPage("/page2", { title: "Page 2" }, []);
    manager.addSidebarItem("section1", {
      type: "link",
      label: "Item 1",
      url: "/page1",
    });
    manager.addSidebarItem("section1", {
      type: "link",
      label: "Item 2",
      url: "/page2",
    });

    expect(manager.getManifest()).toEqual({
      pages: {
        "/page1": {
          component: expect.any(Function),
          meta: { title: "Page 1" },
          toc: [],
        },
        "/page2": {
          component: expect.any(Function),
          meta: { title: "Page 2" },
          toc: [],
        },
      },
      sidebar: {
        section1: [
          { type: "link", label: "Item 1", url: "/page1" },
          { type: "link", label: "Item 2", url: "/page2" },
        ],
      },
      children: {
        "/": ["/page1", "/page2"],
      },
      breadcrumbs: {},
    });

    manager.reset();
    expect(manager.getManifest()).toEqual({
      pages: {},
      sidebar: {},
      children: {},
      breadcrumbs: {},
    });
  });

  it("indexes nested pages under their parent url, independent of the sidebar", () => {
    manager.addPage("/parent/child1", { title: "Child 1" }, []);
    manager.addPage("/parent/child2", { title: "Child 2" }, []);

    expect(manager.getManifest().children).toEqual({
      "/parent": ["/parent/child1", "/parent/child2"],
    });

    manager.reset();
  });

  it("does not index the root page as its own child", () => {
    manager.addPage("/", { title: "Home" }, []);

    expect(manager.getManifest().children).toEqual({});

    manager.reset();
  });

  it("should throw an error for duplicate collection keys and baseUrls", () => {
    manager.checkCollection("key1", "/baseUrl1");

    expect(() => {
      manager.checkCollection("key1", "/baseUrl2");
    }).toThrow('Duplicate collection key: "key1"');

    expect(() => {
      manager.checkCollection("key2", "/baseUrl1");
    }).toThrow('Duplicate collection baseUrl: "/baseUrl1"');
  });

  it("should write the manifest to a file", async () => {
    vi.spyOn(files, "atomicWrite").mockResolvedValue();

    manager.addPage("/page1", { title: "Page 1" }, []);
    manager.addSidebarItem("section1", {
      type: "link",
      label: "Item 1",
      url: "/page1",
    });

    const outDir = "./test-output";
    await manager.writeManifest(outDir);

    expect(files.atomicWrite).toHaveBeenCalledWith(
      "test-output/manifest.js",
      expect.stringContaining("export default {"),
    );
  });

  it("computes breadcrumbs from the sidebar when writing the manifest", async () => {
    vi.spyOn(files, "atomicWrite").mockResolvedValue();
    const isolated = new TestManifestManager();

    isolated.addSidebarItem("section1", {
      type: "group",
      label: "Guides",
      items: [{ type: "link", label: "Item 1", url: "/page1" }],
    });

    await isolated.writeManifest("./test-output");

    expect(isolated.getManifest().breadcrumbs).toEqual({
      section1: {
        "/page1": [{ label: "Guides" }, { label: "Item 1", url: "/page1" }],
      },
    });
  });

  it("COVERAGE PURPOSE: call component API", async () => {
    const page = manager.getManifest().pages["/page1"];
    await expect(page.component()).rejects.toThrow();
  });
});
