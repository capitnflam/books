import { base, depend, react, typeAware, unicorn, vitest } from "@infra-x/code-quality/lint";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [
    base(),
    unicorn(),
    depend(),
    react(),
    vitest({ files: ["**/*.{test,spec}.ts", "**/*.e2e-spec.ts", "**/__tests__/**/*.ts"] }),
  ],
  ignorePatterns: ["dist", "node_modules", "src/routeTree.gen.ts"],
  overrides: [
    {
      files: ["**/*.ts{x,}"],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
    {
      files: ["**/types/*.ts", "**/scripts/*.ts"],
      rules: {
        "import/no-relative-parent-imports": "off",
      },
    },
  ],
});
