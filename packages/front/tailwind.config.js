const { join } = require('path')

const { createGlobPatternsForDependencies } = require('@nx/react/tailwind')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    join(
      __dirname,
      '{src,pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
}
