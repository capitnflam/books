import { base, depend, nextjs, react, unicorn, vitest } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  // ignorePatterns: ["src/components/ui/**"],
  extends: [
    base(),
    unicorn(),
    depend(),
    react(),
    nextjs(),
    vitest({ files: ['**/*.{test,spec}.ts', '**/*.e2e-spec.ts', '**/__tests__/**/*.ts'] }),
  ],
  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        'unicorn/filename-case': 'off',
      },
    },
  ],
})
