/**
 * Add eslint rules regarding jest tests.
 * Using the recommended preset: https://github.com/jest-community/eslint-plugin-jest#rules
 *
 * @type {import("eslint").Linter.Config}
 */
 module.exports = {
  extends: ['plugin:jest/recommended'],
  settings: {
    jest: {
      version: require('jest/package.json').version,
    },
  },
  rules: {
    /**
     * No convention across PayFit organisation
     */
    'jest/consistent-test-it': 'off',
    /**
     * test() and it() should start with lower case names
     */
    'jest/prefer-lowercase-title': [
      'error',
      {
        ignore: ['describe'],
      },
    ],
    /**
     * Checks that the title of Jest blocks are valid by ensuring that titles are:
     * - not empty
     * - a string
     * - not prefixed with their block name
     * - have no leading or trailing spaces
     */
    'jest/valid-title': 'error',
    'jest/no-conditional-expect': 'off',
    /**
     * Expect functions are required, and any other function which can throw
     */
    'jest/expect-expect': [
      'error',
      {
        assertFunctionNames: ['expect', 'request.**.expect', 'findBy*'],
      },
    ],
  },
}
