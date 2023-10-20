const baseConfig = require('../../prettier.config')

/** @type {import("prettier").Config} */
const config = {
  ...baseConfig,
  plugins: [...(baseConfig.plugins ?? []), 'prettier-plugin-tailwindcss'],
}

module.exports = config
