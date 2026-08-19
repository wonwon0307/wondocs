import { defineProject, mergeConfig } from "vitest/config";

import { baseVitestConfig } from "@repo/vitest-config/base";

const config = defineProject({
  test: {
    root: __dirname,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
  },
});

export default mergeConfig(baseVitestConfig, config);
