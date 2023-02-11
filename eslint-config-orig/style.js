// Allow to resolve ESLint plugins when using Yarn PnP without having to install all dependencies of the configuration.
require("@rushstack/eslint-patch/modern-module-resolution")

/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  rules: {
    /**
     * Eslint rules
     */
    /**
     * Should add padding line between statements
     */
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any',    prev: ['const', 'let', 'var'], next: ['const', 'let', 'var']},
      { blankLine: 'always', prev: ['case', 'default'], next: '*' },
      { blankLine: 'never', prev: ['case', 'default'], next: ['case', 'default'] },
      { blankLine: 'always', prev: '*', next: 'return' },
    ],
  },
}
