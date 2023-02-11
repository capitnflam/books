/**
 * Eslint TS configuration, rules: https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
 *
 * Presets used:
 *
 * - `eslint-recommended`
 *      A compatibility ruleset to disable rules from eslint:recommended
 *      which are already handled by TypeScript, and to enable rules that make sense due
 *      to TS typechecking / transpilation.
 *      See https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/eslint-recommended.ts
 *
 * - `recommended`
 *      Recommended rules for TypeScript
 *      See https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/recommended.ts
 *
 * - `recommended-requiring-type-checking`
 *      More advanced and restrictive rules for TypeScript, promoting type safety
 *      See https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/recommended-requiring-type-checking.ts
 *
 * @type {import("eslint").Linter.Config}
 *
 */
 module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    // Turning off eslint rules which might conflict with prettier formatting
    'prettier',
  ],
  env: {
    jest: true,
    node: true,
  },
  rules: {
    /**
     * Variables should be defined before being used, for readability purposes
     * and because scope hoising behaves differently depending on the type
     * of variable (var and functions declaration and initialisation are hoisted up
     * but for let and const only declarations are).
     */
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
    /**
     * Disallow unused variables unless:
     * - for caught errors, the error is named "_e".
     * - for function arguments preceding used arguments.
     * - for function arguments prefixed with _e.
     * - when using destructuring for excluding properties of an object or array.
     */
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
    /**
     * Use T[] or readonly T[] for simple types (i.e. types which are just primitive names
     * or type references). Use Array<T> or ReadonlyArray<T> for all other types (union types,
     * intersection types, object types, function types, etc).
     */
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    /**
     *  Enforce using interfaces for object type definitions, for consistency reasons.
     */
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    /**
     * Enforce using property signature for functions, for maximum correctness
     * together with TypeScript's strict mode (`strictFunctionTypes` set to `true`).
     */
    '@typescript-eslint/method-signature-style': ['error', 'property'],
    /**
     * Ensure naming conventions, disable eslint equivalent.
     */
    camelcase: 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'forbid',
        filter: {
          // Allow React legacy methods prefixed with UNSAFE_
          // and smart_count used in translations
          regex: '^(smart_count$|endpoint_regex$|UNSAFE_)',
          match: false,
        },
        // Exclude checks on object literal parameters for IO compatibility
        // (data received or sent to APIs or libraries).
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
      // Enforce types to be in pascal case format and to not be prefixed with an I,
      // which is an approach promoted by default by a legacy tool (tslint), but which has no basis.
      {
        selector: 'typeLike',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: false,
        },
      },
      // Boolean values should be prefixed with a verb with some exceptions
      // TODO: it would be nice to enable, but will cause breaking changes and rule seems to not work very well.
      // {
      //   selector: 'variable',
      //   types: ['boolean'],
      //   format: ['camelCase'],
      //   prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
      //   filter: {
      //     regex: '^(loading|force)$',
      //     match: false,
      //   },
      // },
    ],

    /**
     * We allow escape hatches from compiling errors by not disallowing ts comments.
     * Because of `prefer-ts-expect-error`, // @ts-ignore is not allowed.
     */
    '@typescript-eslint/ban-ts-comment': 'off',
    /**
     * Explicit return type rule for functions is off. Having returned types explicit rather than inferred
     * can prevent errors, but a blanket rule on it is often impractical (a lot of functions aren't complex).
     *
     * Note: rule is disabled for now, it will be a good idea to enable at some point
     */
    '@typescript-eslint/explicit-function-return-type': [
      'off',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    /**
     * This is a similar rule to the one above, but it requires function arguments to be typed too.
     * For the same reason, we are disabling it.
     *
     * Note: rule is disabled for now, it will be a good idea to enable at some point
     */
    '@typescript-eslint/explicit-module-boundary-types': [
      'off',
      {
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowedNames: [],
        shouldTrackReferences: true,
      },
    ],
    /**
     * Some builtin types have aliases, some types are considered dangerous or harmful.
     * It's often a good idea to ban certain types to help with consistency and safety.
     * - Don't use the upper-case primitive types, you should use the lower-case types for consistency.
     * - Avoid the Function type, as it provides no type safety and allow class declarations
     * - Avoid the Object and {} types, as they mean "any non-nullish value".
     * - Avoid the object type, as it is currently hard to use due to not being able to assert that keys exist.
     * The options used are the default ones, we put them here for explicitness.
     */
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
          // object typing
          Object: {
            message: [
              'The `Object` type actually means "any non-nullish value":',
              '- If you want a type meaning "any object", you probably want `Record<string, unknown>` or `Record<string, any>` instead.',
              '- If you want a type meaning "any value", you probably want `unknown` or `any` instead.',
            ].join('\n'),
          },
          // Preventing misused of `{}`
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
    /**
     * Leaving off accessibility modifier and making everything public can make your interface
     * hard to use by others. If you make all internal pieces private or protected, your interface
     * will be easier to use. The exceptions are constructors, which can only be public.
     */
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: { constructors: 'no-public' },
      },
    ],
    /**
     * Allowing empty functions, as they are useful to swallow errors on promises
     * or to define no-ops.
     */
    '@typescript-eslint/no-empty-function': 'off',
    /**
     * Standardizing the use of type assertion style across the codebase (a.k.a type casting):
     * - Should be done using the `as` keyword instead of angle brackets
     * - When declaring variables, always prefer `const x: T = { ... }` to `const x = { ... } as T`
     *   because the latter can hide an error.
     */
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow-as-parameter',
      },
    ],
    /**
     * Allow non-null assertions (use of `!`) as they are a useful escape hatch in some cases
     * (same than // @ts-expect-error comment)
     */
    '@typescript-eslint/no-non-null-assertion': 'off',
    /**
     * Disallow the use of non-null assertions (`!`) in optional chaining
     * (exception to `no-non-null-assertion` being turned off).
     */
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    /**
     * Prefer nullish coalescing (`??`) over `||`.
     * The exceptions are cases located within a conditional test, or any logical expressions
     * that are part of a mixed logical expression (with `&&`). This is because converting `||`
     * to `??` is not always automatically safe.
     * It is important for this rule to be configured alongside `strict-boolean-expressions` (see below),
     * to avoid values typed as `boolean | undefined` used in conditional expressions, which would force
     * inappropriately `||` to be converted to `??`.
     *
     * TODO: enable in a next PR, as it requires careful refactoring.
     * Enable it with `@typescript-eslint/strict-boolean-expressions`.
     */
    '@typescript-eslint/prefer-nullish-coalescing': [
      'off',
      {
        ignoreConditionalTests: true,
        ignoreMixedLogicalExpressions: true,
      },
    ],
    /**
     * Guard against conditions which might always be true, mostly due to incorrect type declarations.
     * Disallow nullable boolean values.
     *
     * TODO: enable in a next PR, as it requires careful refactoring.
     * Enable it with `@typescript-eslint/prefer-nullish-coalescing`.
     */
    '@typescript-eslint/strict-boolean-expressions': [
      'off',
      {
        allowString: true,
        allowNumber: true,
        allowNullableObject: true,
        allowNullableBoolean: false, // we disallow `boolean | undefined | null`, see `prefer-nullish-coalescing`
        allowNullableString: true,
        allowNullableNumber: true,
        allowAny: true,
      },
    ],
    /**
     * RegExp#exec is faster than String#match and both work the same when not using the /g flag.
     * Performance gains are marginal in the vast majority of cases so we disable that rule
     * for keeping a consistent way to math (with or without the /g flag).
     */
    '@typescript-eslint/prefer-regexp-exec': 'off',
    /**
     * Disallow floating promises (promises without error handling).
     */
    '@typescript-eslint/no-floating-promises': [
      'error',
      {
        ignoreVoid: true,
      },
    ],
    /**
     * Values used in template expressions should be string values only,
     * and we forgive the use of any.
     */
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowAny: true,
      },
    ],
    /**
     * Forbid the use of classes as namespaces
     */
    '@typescript-eslint/no-extraneous-class': [
      'error',
      {
        // We allow constructors only because we also allow the use of parameter properties in class constructors
        // https://www.typescriptlang.org/docs/handbook/classes.html#parameter-properties
        allowConstructorOnly: true,
        allowEmpty: false,
        allowStaticOnly: false,
        allowWithDecorator: false,
      },
    ],
    /**
     * Disallows usage of void type outside of return types or generic type arguments.
     * If void is used as return type, it shouldn’t be a part of intersection/union type with most other types.
     */
    '@typescript-eslint/no-invalid-void-type': [
      'error',
      {
        // For example, in promises
        allowInGenericTypeArguments: true,
      },
    ],
    /**
     * Disallow throwing literal values. It is considered good practice to only throw the Error object itself
     * or an object using the Error object as base objects for user-defined exceptions. The fundamental benefit
     * of Error objects is that they automatically keep track of where they were built and originated.
     */
    '@typescript-eslint/no-throw-literal': 'error',
    /**
     * Recommend a for-of loop when the loop index is only used to read from an array that is being iterated.
     */
    '@typescript-eslint/prefer-for-of': 'warn',
    /**
     * Enforce casting reduce operator with a generic rather than casting the initial value.
     * This allows better type safety by ensuring the reduce callback correctness.
     */
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    /**
     * Enforce a consistent way to check whether a string starts or ends with a specific string.
     * Disallow the use of `.indeOf()` or regular expressions in such cases.
     */
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    /**
     * Prefer to use // @ts-expect-error (new in 3.9) over // @ts-ignore, which removes type checking
     * entirely. It essentially bans the use of ts-ignore directive.
     */
    '@typescript-eslint/prefer-ts-expect-error': 'error',
    /**
     * Enforce use of optional chaining for more concise code.
     */
    '@typescript-eslint/prefer-optional-chain': 'error',
    /**
     * The following rules are disabled because our TypeScript configs allow
     * the use of explicit any. We could revisit at some point strictness
     * of TypeScript configuration.
     */
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    /**
     * For code readability, variables should not be shadowed
     * in a child scope.
     */
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    /**
     * Avoid class methods or non arrow-function object methods to be
     * called by reference (and thus unbounded).
     */
    '@typescript-eslint/unbound-method': 'error',
    /**
     * Prevent promises to be incorrectly used in conditions (always truthy).
     * Also prevent to use an async function where a void return is expected,
     * thus forcing error handling inside the function rather than expecting
     * the consumer to do it.
     */
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksConditionals: true,
        checksVoidReturn: true,
      },
    ],
    /**
     * TODO: enable in next release of TS eslint plugin
     * Prevent explicitly returning the result of a void expression.
     * If it can be correct type-wise (a function returning nothing, i.e. void),
     * it can be confusing for other developers to read.
     */
    // '@typescript-eslint/no-confusing-void-expression': [
    //   'error',
    //   {
    //     ignoreArrowShorthand: true,
    //   },
    // ],
    '@typescript-eslint/typedef': 'error',
    // Really painfull to have it activated by default
    '@typescript-eslint/no-unsafe-argument': 'off',
  },
  /**
   * Override some rules on JS files
   */
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
  ],
}
