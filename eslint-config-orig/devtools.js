// Allow to resolve ESLint plugins when using Yarn PnP without having to install all dependencies of the configuration.
require("@rushstack/eslint-patch/modern-module-resolution")

/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: [require.resolve('./base')],
  env: {
    node: true,
  },
  plugins: ['node'],
  rules: {
    /**
     * We allow the use of `process.exit()` in dev tools
     */
    'no-process-exit': 'off',
    /**
     * Allow require()
     */
    '@typescript-eslint/no-var-requires': 'off',
    /**
     * Providing linting on use of node builtins
     * (default Node versions 12 and above)
     */
    'node/no-unsupported-features/node-builtins': [
      'error',
      {
        version: '>=12.0.0',
      },
    ],
  },
}
