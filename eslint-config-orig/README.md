# eslint-config

**Package name:** `@payfit/eslint-config`

Global eslint configuration for TypeScript projects. It includes 3 different configs for

- React
- Node
- Style
- Dev tools (Node project with relaxed security rules)

### Requirements

- Eslint v7.x needs to be installed
- At least TypeScript 3.9 is required

### Under the hood

The `@typescript-eslint` parser is used, with the following plugins and presets:

- eslint recommended preset
- TypeScript eslint recommended and "recommended requiring type checking" presets
- eslint jest plugin with recommended preset
- eslint import plugin with recommended preset
- eslint sonarjs plugin with recommended preset
- eslint security plugin with recommended preset
- eslint react plugin with recommended preset
- eslint react accessibility plugin with recommended preset
- eslint xss plugin with recommended preset

Recommended presets are extending with other rules that you can see in:

- [Base configs](./configs)
- [React config](./react.js)
- [Node config](./node.js)
- [Style config](./style.js)

### Usage

It is important to link a `tsconfig.json` file as some TypeScript eslint lint perform some type checking.

#### Linking sibling TS configs

Inside a package, add the following `.eslintrc.js` (JS) file:

```js
/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: ['@payfit/eslint-config/devtool'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
}
```

The `extends` value can be:

- `"@payfit/eslint-config/react"`
- `"@payfit/eslint-config/node"`
- `"@payfit/eslint-config/style"`
- `"@payfit/eslint-config/devtool"`

### With style config

Pay attention that this configuration cannot be used in a standalone mode, you need to pair it with `@payfit/eslint-config/react` or `@payfit/eslint-config/node`.

```json
{
  "extends": ["@payfit/eslint-config/react", "@payfit/eslint-config/style"],
  "parserOptions": {
    "project": "./tsconfig.eslint.json"
  }
}
```

#### With a root TS config

Inside a package, add the following `.eslintrc` file:

```json
{
  "extends": "@payfit/eslint-config/react",
  "parserOptions": {
    "project": "./tsconfig.eslint.json"
  }
}
```

In this first approach, `tsconfig.eslint.json` is a TS config file at the root of your repo and it should extend `@payfit/tsconfig/tsconfig.eslint.json`.

## Things worth to know

To avoid disabling some rules here is what you need to know:

- `import/no-extraneous-dependencies`: this rule checks that only dependencies, peer dependencies and optional dependencies are used. The exceptions are test files and files located in a `dev` directory.
- `no-param-reassign`: this rule will get on the way of `.reduce` functions. The solution is to name the accumulator `acc` or a name ending with `Acc`.
