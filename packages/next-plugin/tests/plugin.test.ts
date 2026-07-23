import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
} from "next/constants";

import { createWonDocs } from "@/plugin";

const loadConfigMock = vi.hoisted(() => vi.fn().mockReturnValue({}));
const buildMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const watchMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ close: () => {} }),
);

vi.mock("@wondocs/core/config", () => ({
  loadConfig: loadConfigMock,
}));
vi.mock("@wondocs/core/build", () => ({
  buildDocs: buildMock,
}));
vi.mock("@wondocs/core/watch", () => ({
  watchDocs: watchMock,
}));

describe("createWonDocs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call buildDocs in the production build phase", async () => {
    const withWondocs = createWonDocs({});
    const nextConfigPromise = withWondocs({});
    const nextConfig = await nextConfigPromise(PHASE_PRODUCTION_BUILD);

    expect(nextConfig).toHaveProperty("turbopack");
    expect(nextConfig.turbopack).toHaveProperty("resolveAlias");
    expect(nextConfig.turbopack?.resolveAlias).toHaveProperty(
      "#wondocs/sidebar",
    );

    expect(loadConfigMock).toHaveBeenCalled();
    expect(buildMock).toHaveBeenCalled();
  });

  it("should not build or watch in the production server phase (e.g. `next start`)", async () => {
    const withWondocs = createWonDocs({});
    const nextConfigPromise = withWondocs({});
    const nextConfig = await nextConfigPromise(PHASE_PRODUCTION_SERVER);

    // resolveAlias must still point at the already-built .wondocs output
    expect(nextConfig).toHaveProperty("turbopack");
    expect(nextConfig.turbopack).toHaveProperty("resolveAlias");
    expect(nextConfig.turbopack?.resolveAlias).toHaveProperty(
      "#wondocs/sidebar",
    );

    // but re-scanning/recompiling docs on every server boot must not happen
    expect(buildMock).not.toHaveBeenCalled();
    expect(watchMock).not.toHaveBeenCalled();
  });

  it("should call watchDocs in dev phase", async () => {
    const withWondocs = createWonDocs({});
    const nextConfigPromise = withWondocs({});
    const nextConfig = await nextConfigPromise(PHASE_DEVELOPMENT_SERVER);

    expect(nextConfig).toHaveProperty("turbopack");
    expect(nextConfig.turbopack).toHaveProperty("resolveAlias");
    expect(nextConfig.turbopack?.resolveAlias).toHaveProperty(
      "#wondocs/sidebar",
    );

    expect(loadConfigMock).toHaveBeenCalled();
    expect(watchMock).toHaveBeenCalled();
  });

  it("should close a previously open watch handle when dev phase runs again", async () => {
    const withWonDocs = createWonDocs({});
    const configFn = withWonDocs({});

    const firstClose = vi.fn();
    watchMock.mockResolvedValueOnce({ close: firstClose });
    await configFn(PHASE_DEVELOPMENT_SERVER);

    const secondClose = vi.fn();
    watchMock.mockResolvedValueOnce({ close: secondClose });
    await configFn(PHASE_DEVELOPMENT_SERVER);

    expect(firstClose).toHaveBeenCalledOnce();
    expect(secondClose).not.toHaveBeenCalled();
  });
});
