require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: [
    '@flaminc/eslint-config/typescript',
    '@flaminc/eslint-config/react',
    '@flaminc/eslint-config/jest',
  ],
  parserOptions: {
    // projectFolderIgnoreList: ['**/node_modules/**', '**/dist/**'],
    // ecmaVersion: 2020,
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    // ecmaFeatures: {
    //   jsx: true,
    // },
  },
}
