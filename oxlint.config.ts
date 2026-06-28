import { base, depend, typeAware, unicorn } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), typeAware(), unicorn(), depend()],
  ignorePatterns: ['dist', 'node_modules', 'src/routeTree.gen.ts'],
})
