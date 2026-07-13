import { defineConfig } from "eslint/config";
import { baseEslintConfig } from "@repo/eslint-config/base";

export default defineConfig([
  {
    extends: [baseEslintConfig],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
