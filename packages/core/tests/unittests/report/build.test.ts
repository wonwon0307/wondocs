import { computeReport, printReport } from "@/report/build";
import type { LinkRef } from "@/meta/types";

vi.unmock("@/report/build");

describe("computeReport", () => {
  it("counts external links separately from internal ones", () => {
    const links: LinkRef[] = [
      { href: "guides/a", external: false, disabled: false },
      { href: "https://example.com", external: true, disabled: false },
    ];

    const report = computeReport(links, new Set(["guides/a"]));

    expect(report.external).toEqual(1);
    expect(report.linked).toEqual(1);
    expect(report.broken).toEqual([]);
  });

  it("classifies an active link with no matching file as broken", () => {
    const links: LinkRef[] = [
      { href: "guides/missing", external: false, disabled: false },
    ];

    const report = computeReport(links, new Set());

    expect(report.broken).toEqual(["guides/missing"]);
    expect(report.pending).toEqual([]);
  });

  it("classifies a disabled link with no matching file as pending, not broken", () => {
    const links: LinkRef[] = [
      { href: "guides/coming-soon", external: false, disabled: true },
    ];

    const report = computeReport(links, new Set());

    expect(report.pending).toEqual(["guides/coming-soon"]);
    expect(report.broken).toEqual([]);
  });

  it("classifies filetree hrefs missing from the sidebar as unlinked", () => {
    const links: LinkRef[] = [
      { href: "guides/a", external: false, disabled: false },
    ];

    const report = computeReport(links, new Set(["guides/a", "guides/orphan"]));

    expect(report.unlinked).toEqual(["guides/orphan"]);
  });
});

describe("printReport", () => {
  it("throws when there are broken links", () => {
    expect(() =>
      printReport({
        external: 0,
        linked: 0,
        broken: ["guides/missing"],
        pending: [],
        unlinked: [],
      }),
    ).toThrow("[WonDocs] Broken sidebar links");
  });

  it("does not throw when there are only pending or unlinked entries", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      printReport({
        external: 0,
        linked: 0,
        broken: [],
        pending: ["guides/coming-soon"],
        unlinked: ["guides/orphan"],
      }),
    ).not.toThrow();

    expect(console.warn).toHaveBeenCalled();
  });
});
