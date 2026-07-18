import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/build.ts", "src/sidebar.ts"],
    format: ["esm"],
    dts: true,
    clean: false,
  },
]);
