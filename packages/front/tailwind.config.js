const { join } = require('path')

const { nextui } = require('@nextui-org/react')
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
    join(
      __dirname,
      './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    ),
  ],
  theme: {
    extend: {},
  },
  plugins: [
    nextui(),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
