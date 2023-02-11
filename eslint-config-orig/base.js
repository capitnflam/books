// Allow to resolve ESLint plugins when using Yarn PnP without having to install all dependencies of the configuration.
require("@rushstack/eslint-patch/modern-module-resolution")

const checkIfJestIsPresent = () => {
  try {
    require('jest')
    return true
  } catch {
    return false
  }
}

const hasJest = checkIfJestIsPresent()

/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: [
    require.resolve('./configs/eslint'),
    require.resolve('./configs/typescript-eslint'),
    require.resolve('./configs/sonar'),
    require.resolve('./configs/import'),
  ].concat(hasJest ? require.resolve('./configs/jest') : []),
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '*.d.ts',
    '.eslintrc.js',
    'jest.config.js',
  ],
  env: {
    jest: hasJest,
    node: true,
  },
}
