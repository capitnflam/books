const tailwind = require('prettier-plugin-tailwindcss')

const baseConfig = require('../../prettier.config')

/** @type {import("prettier").Config} */
const config = {
  ...baseConfig,
  plugins: [...(baseConfig.plugins ?? []), tailwind],
}

module.exports = config
