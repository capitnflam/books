/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    projectFolderIgnoreList: ['**/node_modules/**', '**/dist/**'],
    ecmaVersion: 2020,
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
    'import/external-module-folders': ['node_modules'],
  },
  plugins: ['security', 'xss', 'no-unsanitized'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:sonarjs/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/jsx-runtime',
    'plugin:tailwindcss/recommended',
    'prettier',
  ],
  root: true,
  env: {
    browser: true,
    jest: true,
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '*.d.ts',
    '.eslintrc.js',
    '*.config.js',
  ],
  rules: {
    'no-constructor-return': 'error',
    eqeqeq: ['error', 'always'],
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
    'no-var': 'error',
    'prefer-const': [
      'error',
      {
        ignoreReadBeforeAssign: true,
      },
    ],
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: [
          'acc', // for reduce functions
          'e', // for errors in catch blocks
          'req', // for Express requests
          'request', // for Express requests
          'res', // for Express responses
          'response', // for Express responses
          'staticContext', // for ReactRouter context
        ],
        ignorePropertyModificationsForRegex: ['Acc$'],
      },
    ],
    'no-eval': 'error',
    'no-else-return': ['error', { allowElseIf: false }],
    'no-extend-native': 'error',
    curly: 'error',
    'no-implicit-globals': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal': 'error',
    'no-octal-escape': 'error',
    'no-proto': 'error',
    'no-caller': 'error',
    'no-restricted-properties': [
      'error',
      {
        object: 'Math',
        property: 'pow',
        message: 'Use the exponentiation operator (**) instead.',
      },
    ],
    'no-restricted-globals': [
      'error',
      {
        name: 'isFinite',
        message: 'Use Number.isFinite instead.',
      },
      {
        name: 'isNaN',
        message: 'Use Number.isNaN instead',
      },
    ],
    'no-return-assign': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: false,
        allowTernary: false,
        allowTaggedTemplates: false,
      },
    ],
    'no-useless-call': 'off',
    'no-useless-catch': 'error',
    'no-useless-concat': 'error',
    'no-useless-escape': 'error',
    'no-useless-return': 'error',
    radix: 'error',
    'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],

    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        enums: false,
        typedefs: false,
        ignoreTypeReferences: true,
        functions: false,
        classes: false,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '_e',
        // TODO: configuration exists because of an issue with `declare global`
        varsIgnorePattern: '^Window$',
      },
    ],
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/method-signature-style': ['error', 'property'],
    camelcase: 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'forbid',
        filter: {
          regex: '^(smart_count$|endpoint_regex$|UNSAFE_)',
          match: false,
        },
        selector: [
          'variableLike',
          'class',
          'classMethod',
          'classProperty',
          'objectLiteralMethod',
          'typeAlias',
          'enum',
          'enumMember',
        ],
      },
      {
        selector: 'property',
        format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'forbid',
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: false,
        },
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-function-return-type': [
      'off',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': [
      'off',
      {
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowedNames: [],
        shouldTrackReferences: true,
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: false,
        types: {
          String: {
            message: 'Use string instead',
            fixWith: 'string',
          },
          Boolean: {
            message: 'Use boolean instead',
            fixWith: 'boolean',
          },
          Number: {
            message: 'Use number instead',
            fixWith: 'number',
          },
          Symbol: {
            message: 'Use symbol instead',
            fixWith: 'symbol',
          },
          Function: {
            message: [
              'The `Function` type accepts any function-like value.',
              'It provides no type safety when calling the function, which can be a common source of bugs.',
              'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
              'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.',
            ].join('\n'),
          },
          Object: {
            message: [
              'The `Object` type actually means "any non-nullish value":',
              '- If you want a type meaning "any object", you probably want `Record<string, unknown>` or `Record<string, any>` instead.',
              '- If you want a type meaning "any value", you probably want `unknown` or `any` instead.',
            ].join('\n'),
          },
          '{}': {
            message: [
              '`{}` actually means "any non-nullish value":',
              '- If you want a type meaning "any object", you probably want `Record<string, unknown>` or `Record<string, any>` instead.',
              '- If you want a type meaning "any value", you probably want `unknown` or `any` instead.',
              '- If you want to set a generic as an empty object, you probably want to use `never` or `Record<string, unknown>` instead',
            ].join('\n'),
          },
          object: {
            message: [
              'The `object` type is currently hard to use ([see this issue](https://github.com/microsoft/TypeScript/issues/21732)).',
              'Consider using `Record<string, unknown>` or `Record<string, any>` instead, as it allows you to more easily inspect and use the keys.',
            ].join('\n'),
          },
        },
      },
    ],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: { constructors: 'no-public' },
      },
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow-as-parameter',
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': [
      'off',
      {
        ignoreConditionalTests: true,
        ignoreMixedLogicalExpressions: true,
      },
    ],
    '@typescript-eslint/strict-boolean-expressions': [
      'off',
      {
        allowString: true,
        allowNumber: true,
        allowNullableObject: true,
        allowNullableBoolean: false,
        allowNullableString: true,
        allowNullableNumber: true,
        allowAny: true,
      },
    ],
    '@typescript-eslint/prefer-regexp-exec': 'off',
    '@typescript-eslint/no-floating-promises': [
      'error',
      {
        ignoreVoid: true,
      },
    ],
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowAny: true,
      },
    ],
    '@typescript-eslint/no-extraneous-class': [
      'error',
      {
        allowConstructorOnly: true,
        allowEmpty: false,
        allowStaticOnly: false,
        allowWithDecorator: false,
      },
    ],
    '@typescript-eslint/no-invalid-void-type': [
      'error',
      {
        allowInGenericTypeArguments: true,
      },
    ],
    '@typescript-eslint/no-throw-literal': 'error',
    '@typescript-eslint/prefer-for-of': 'warn',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/prefer-ts-expect-error': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksConditionals: true,
        checksVoidReturn: true,
      },
    ],
    '@typescript-eslint/typedef': 'error',
    '@typescript-eslint/no-unsafe-argument': 'off',
    'sonarjs/no-duplicate-string': ['error', 10],
    'sonarjs/cognitive-complexity': ['error', 50],
    'sonarjs/prefer-immediate-return': 'off',
    'sonarjs/no-identical-functions': 'off',
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        peerDependencies: true,
        optionalDependencies: true,
      },
    ],
    'import/no-useless-path-segments': 'off',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'error',
    'import/first': 'warn',
    'import/newline-after-import': 'warn',
    'no-alert': 'error',
    'no-console': 'warn',
    'xss/no-location-href-assign': 'error',
    'no-unsanitized/method': 'warn',
    'no-unsanitized/property': 'warn',
    'jsx-a11y/anchor-has-content': 'off',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: [],
      },
    ],
    'jsx-a11y/aria-role': [
      'error',
      {
        ignoreNonDOM: true,
      },
    ],
    'jsx-a11y/control-has-associated-label': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-autofocus': 'off',
    'react/display-name': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['tsx'] }],
    'react/jsx-props-no-spreading': 'off',
    'react/no-array-index-key': 'off',
    'react/prefer-stateless-function': 'error',
    'react/prop-types': 'off',
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',
    'security/detect-unsafe-regex': 'warn',
    'security/detect-non-literal-regexp': 'warn',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
      },
    },
    {
      files: ['*.config.js', '.eslintrc.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['**/__tests__/**/*', '**/*.config.js'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/__tests__/**/*.ts',
        '**/__tests__/**/*.tsx',
      ],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/require-await': 'off',
      },
    },
  ],
}
