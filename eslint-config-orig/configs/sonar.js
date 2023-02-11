/**
 * Sonar rules
 * https://github.com/SonarSource/eslint-plugin-sonarjs
 *
 * @type {import("eslint").Linter.Config}
 */
 module.exports = {
  extends: ['plugin:sonarjs/recommended'],
  rules: {
    /**
     * Limiting the number of duplicated strings, but to a high number for now.
     */
    'sonarjs/no-duplicate-string': ['error', 10],
    /**
     * Cognitive complexity relates to problem complexity so setting
     * the limit to a high enough number so it is not on the way.
     */
    'sonarjs/cognitive-complexity': ['error', 50],
    /**
     * In TS, sometimes it is easier to define a typed variable and then return it
     * to get better type hints or to provide clarity, so we disable this Sonar rule
     * enforcing to return immediately.
     */
    'sonarjs/prefer-immediate-return': 'off',
    /**
     * By default Sonar will error if identical functions of more than 3 lines are declared
     * in a same files, but by experience there are numerous cases (use of closures being one)
     * where such a rule would force awkward abstractions for the sake of re-usability and impact
     * readability. We are warning instead.
     */
    'sonarjs/no-identical-functions': 'off',
  },
}
