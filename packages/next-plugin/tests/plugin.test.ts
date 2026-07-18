import { createWonDocs } from "@/plugin";

const loadConfigMock = vi.hoisted(() => vi.fn().mockReturnValue({}));
const buildMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@wondocs/core/config", () => ({
  loadConfig: loadConfigMock,
}));
vi.mock("@wondocs/core/build", () => ({
  buildDocs: buildMock,
}));

describe("createWonDocs", () => {
  it("should return a function that returns a NextConfig object", async () => {
    const nextConfig = await createWonDocs()({});

    expect(nextConfig).toHaveProperty("turbopack");
    expect(nextConfig.turbopack).toHaveProperty("resolveAlias");
    expect(nextConfig.turbopack?.resolveAlias).toHaveProperty(
      "#wondocs/manifest",
    );

    expect(loadConfigMock).toHaveBeenCalled();
    expect(buildMock).toHaveBeenCalled();
  });
});
