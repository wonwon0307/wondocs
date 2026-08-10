import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: [
      "src/config/index.ts",
      "src/build.ts",
      "src/page.ts",
      "src/sidebar.ts",
      "src/watch.ts",
    ],
    format: ["esm"],
    dts: true,
    clean: false,
    deps: {
      onlyBundle: false,
    },
    // #wondocs/* resolve locally to empty placeholder modules (see tsconfig.json
    // paths) so tsc/vitest are happy, but they must stay unresolved import
    // specifiers in dist/ — the consuming app's bundler aliases them to its own
    // generated manifest at runtime. Without this, tsdown bundles the empty
    // placeholder straight into dist, permanently baking in an empty manifest.
    external: ["#wondocs/sidebar", "#wondocs/pages"],
  },
]);
