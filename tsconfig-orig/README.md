# TS Configs

### Usage

- [x] Be sure to have required `typescript` peer dependency version installed
- [x] `yarn add @payfit/tsconfig --dev`
- [x] Extend your local TS config files with the ones provided by this package

```json
{
  "extends": "@payfit/tsconfig/tsconfig.node.json",
  "compilerOptions": {
    "baseDir": ".",
    "rootDir": "src",
    "outDir": "dist",
    "declarationDir": "dist"
  },
  "include": ["./src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Available configs

- Node: `@payfit/tsconfig/tsconfig.node.json`.
- React: `@payfit/tsconfig/tsconfig.react.json`.
- Base (to extend for other environments like webworkers): `@payfit/tsconfig/tsconfig.base.json`.
- Eslint: `@payfit/tsconfig/tsconfig.eslint.json` to use as a root TS config for linting (we recommend linking local configs instead, see [](../eslint-config/README.md#usage)). This config is only meant to be used at the root of monorepos.

### Consistent usage of TS

This package promotes a consistent and safe usage of TypeScript (strict mode).

Some rules are disabled like `noExplicitAny`, `noImplicitReturns`, `noUnusedLocals` to avoid a painful dev experience, but this kind of rule will be covered by eslint
