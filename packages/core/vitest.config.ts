import { defineProject, mergeConfig } from "vitest/config";

import { baseVitestConfig } from "@repo/vitest-config/base";

const config = defineProject({
  test: {
    root: __dirname,
    environment: "jsdom",
  },
});

export default mergeConfig(baseVitestConfig, config);
