/**
 * Eslint rules for imports
 * https://github.com/benmosher/eslint-plugin-import
 *
 * @type {import("eslint").Linter.Config}
 */
 module.exports = {
  extends: [
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    /**
     * Sorting import declaration statements alphabetically.
     */
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
    ],
    /**
     * Disallow the use of dev dependencies except in test files
     */
    'import/no-extraneous-dependencies': [
      'error',
      {
        peerDependencies: true,
        optionalDependencies: true,
      },
    ],
    'import/no-useless-path-segments': 'off',
    /**
     * Ordering imports consistently by groups
     */
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: [
          ['builtin', 'external'],
          'internal',
          'unknown',
          'parent',
          ['sibling', 'index'],
        ],
      },
    ],
    /**
     * We don't enforce the use of default exports.
     * Having named exports provides better IDE support with:
     * - auto importing correctly
     * - better following of imports
     */
    'import/prefer-default-export': 'off',
    /**
     * Disallow unresolved import, which can be down to a missing dependency
     */
    'import/no-unresolved': 'error',
  },
  overrides: [
    {
      files: [
        '**/__tests__/**/*',
        '**/*.test.{js,ts,tsx}',
        '**/dev/**/*',
        '**/jest.config.js',
      ],
      rules: {
        /**
         * For test and development files, we don't want to prevent
         * dev dependencies being hoisted up to the root of monorepos.
         */
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
    'import/external-module-folders': ['node_modules'],
  },
}
