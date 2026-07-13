import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/*"],
    coverage: {
      exclude: [
        "**/index.ts",
        "**/*/tests/*",
        "**/dist/*",
        "**/node_modules/*",
      ],
      provider: "v8",
      reporter: [["text", { skipFull: true }]],
    },
  },
});
