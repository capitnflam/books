/**
 * Eslint rules configuration
 * https://eslint.org/docs/rules/
 *
 * Using the recommended preset + useful rules.
 *
 * @type {import("eslint").Linter.Config}
 */
 module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    /**
     * A class constructor should not return a value,
     * but early returns are allowed.
     */
    'no-constructor-return': 'error',
    /**
     * Triple equal should always be used for comparing
     * values or references.
     */
    eqeqeq: ['error', 'always'],
    /**
     * Class members should be separated by a new line
     */
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
    /**
     * const or let should be used rather than var.
     */
    'no-var': 'error',
    /**
     * Prefer const over let if a value is not re-assigned.
     * Configured to not conflict with TS `no-use-before-define`.
     */
    'prefer-const': [
      'error',
      {
        ignoreReadBeforeAssign: true,
      },
    ],
    /**
     * Disallow re-assigning function parameters.
     * Unfortunately this rule doesn't play nicely with `.reduce`.
     */
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
          '$scope', // for Angular 1 scopes
          'staticContext', // for ReactRouter context
        ],
        ignorePropertyModificationsForRegex: ['Acc$'],
      },
    ],
    /**
     * Disallow use of eval
     */
    'no-eval': 'error',
    /**
     * Disallow the use of `else if` after a return
     */
    'no-else-return': ['error', { allowElseIf: false }],
    /**
     * Disallow extending native types
     */
    'no-extend-native': 'error',
    /**
     * Enforce consistency by always having curly braces around blocks.
     */
    curly: 'error',
    /**
     * Disallow not explicitly setting globals
     */
    'no-implicit-globals': 'error',
    /**
     * Disallow label statements (obscure feature)
     */
    'no-labels': 'error',
    /**
     * Disallow unnecessary nested blocks
     */
    'no-lone-blocks': 'error',
    /**
     * Disallow creation of functions within loops
     */
    'no-loop-func': 'error',
    /**
     * Disallow creating new instances of String, Number, and Boolean
     */
    'no-new-wrappers': 'error',
    /**
     * Disallow use of (old style) octal literals
     */
    'no-octal': 'error',
    /**
     * Disallow use of octal escape sequences in string literals
     */
    'no-octal-escape': 'error',
    /**
     * Disallow usage of __proto__ property
     */
    'no-proto': 'error',
    /**
     * Disallow use of arguments.caller and arguments.callee which are deprecated.
     */
    'no-caller': 'error',
    /**
     * Disallow certain properties and APIs in favour of others.
     */
    'no-restricted-properties': [
      'error',
      {
        object: 'Math',
        property: 'pow',
        message: 'Use the exponentiation operator (**) instead.',
      },
    ],
    /**
     * Disallow some globals in favour of other APIs.
     */
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
    /**
     * Disallow assignments in return statements, for readability.
     */
    'no-return-assign': 'error',
    /**
     * Disallow unmodified conditions of loops
     */
    'no-unmodified-loop-condition': 'error',
    /**
     * Disallow usage of expressions in statement position
     */
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: false,
        allowTernary: false,
        allowTaggedTemplates: false,
      },
    ],
    /**
     * Disallow unnecessary .call() and .apply()
     */
    'no-useless-call': 'off',
    /**
     * Disallow unnecessary catch clauses
     */
    'no-useless-catch': 'error',
    /**
     * Disallow useless string concatenation
     */
    'no-useless-concat': 'error',
    /**
     * Disallow unnecessary string escaping
     */
    'no-useless-escape': 'error',
    /**
     * Disallow redundant return; keywords
     */
    'no-useless-return': 'error',
    /**
     * Require use of the second argument for parseInt()
     */
    radix: 'error',
    /**
     * Promise errors are not typable, so require using Error objects in rejection reasons
     */
    'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
  },
}
