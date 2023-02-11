// Allow to resolve ESLint plugins when using Yarn PnP without having to install all dependencies of the configuration.
require("@rushstack/eslint-patch/modern-module-resolution")

/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: [
    require.resolve('./base'),
    'plugin:node/recommended',
    require.resolve('./configs/node-security'),
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    projectFolderIgnoreList: ['**/node_modules/**', '**/dist/**'],
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
  },
  rules: {
    /**
     * Disabling eslint feature node recommended rules
     * because of TypeScript compilation.
     */
    'node/no-unsupported-features/es-builtins': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    /**
     * Disabling import node recommended rules
     * because eslint-plugin-import is used instead.
     */
    'node/no-missing-import': 'off',
    'node/no-unpublished-import': 'off',
    'node/no-extraneous-import': 'off',
    'node/no-extraneous-require': 'off',
    /**
     * Supporting latest node features (from LTS)
     */
    'node/no-unsupported-features/node-builtins': [
      'error',
      {
        version: '>=12.0.0',
      },
    ],
  },
}
