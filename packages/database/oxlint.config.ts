import { base, depend, unicorn, vitest } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [
    base(),
    unicorn(),
    depend(),
    vitest({ files: ['**/*.{test,spec}.ts', '**/*.e2e-spec.ts', '**/__tests__/**/*.ts'] }),
  ],
  overrides: [
    {
      files: ['**/types/*.ts', '**/scripts/*.ts'],
      rules: {
        'import/no-relative-parent-imports': 'off',
      },
    },
  ],
})
