module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'prettier',
    'sonarjs',
    'nestjs',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:sonarjs/recommended',
    'plugin:nestjs/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',

    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
  ignorePatterns: ['.eslintrc.js', 'test', '*.spec.ts'],
}
