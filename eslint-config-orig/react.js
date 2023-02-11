// Allow to resolve ESLint plugins when using Yarn PnP without having to install all dependencies of the configuration.
require('@rushstack/eslint-patch/modern-module-resolution')

/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: [
    require.resolve('./base'),
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    // Turning off eslint rules which might conflict with prettier formatting
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['react-hooks', 'security', 'xss', 'no-unsanitized'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    projectFolderIgnoreList: ['**/node_modules/**', '**/dist/**'],
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
  },
  rules: {
    /**
     * Eslint rules
     */
    /**
     * No window.alert should be used by default
     */
    'no-alert': 'error',
    /**
     * Warning when console logging is used
     * (visible by users)
     */
    'no-console': 'warn',
    /**
     * XSS
     */
    'xss/no-location-href-assign': 'error',
    /**
     * Unsanitized HTML
     */
    'no-unsanitized/method': 'warn',
    'no-unsanitized/property': 'warn',
    /**
     * Accessibility
     */
    'jsx-a11y/anchor-has-content': 'off',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: [],
      },
    ],
    'jsx-a11y/aria-role': [
      'error',
      {
        ignoreNonDOM: true,
      },
    ],
    'jsx-a11y/control-has-associated-label': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-autofocus': 'off',
    /**
     * React
     */
    'react/display-name': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['tsx'] }],
    'react/jsx-props-no-spreading': 'off',
    'react/no-array-index-key': 'off',
    'react/prefer-stateless-function': 'error',
    'react/prop-types': 'off',
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    /**
     * Security
     */
    'security/detect-unsafe-regex': 'warn',
    'security/detect-non-literal-regexp': 'warn',
  },
  overrides: [
    {
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/__tests__/**/*.ts',
        '**/__tests__/**/*.tsx',
      ],
      rules: {
        /**
         * Not warning for console usage in tests
         */
        'no-console': 'off',
        /**
         * Some React tests require the use of the async keyword (within act function)
         * but won't have any await keyword.
         */
        '@typescript-eslint/require-await': 'off',
      },
    },
  ],
}
