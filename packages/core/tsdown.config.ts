import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/*/index.ts"],
    format: ["esm"],
    dts: true,
    clean: false,
    deps: {
      onlyBundle: false,
      neverBundle: ["#wondocs/manifest"],
    },
  },
]);
