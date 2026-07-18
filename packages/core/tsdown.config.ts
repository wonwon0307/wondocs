import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/config/index.ts", "src/build.ts", "src/sidebar.ts"],
    format: ["esm"],
    dts: true,
    clean: false,
    deps: {
      onlyBundle: false,
    },
  },
]);
