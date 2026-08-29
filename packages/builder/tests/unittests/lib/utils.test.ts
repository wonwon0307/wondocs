import { relPathToUrl } from "@/lib/url";

describe("relPathToUrl - corner case", () => {
  it("should early exit", () => {
    expect(relPathToUrl("/")).toBe("/");
  });
});
