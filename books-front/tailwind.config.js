const tailwindTypography = require('@tailwindcss/typography')
const tailwindForms = require('@tailwindcss/forms')
const tailwindLineClamp = require('@tailwindcss/line-clamp')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['src/**/*.{js,ts,jsx,tsx}', 'public/index.html'],
  plugins: [tailwindTypography, tailwindForms, tailwindLineClamp],
}
