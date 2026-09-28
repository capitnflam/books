import { format } from "@books/oxc-config/format";
import { defineConfig } from "oxfmt";

export default defineConfig(
  format(),
  //   {
  //   arrowParens: 'always',
  //   bracketSameLine: false,
  //   bracketSpacing: true,
  //   embeddedLanguageFormatting: 'auto',
  //   endOfLine: 'lf',
  //   experimentalOperatorPosition: 'start',
  //   htmlWhitespaceSensitivity: 'css',
  //   // ignorePatterns: ["node_modules"],
  //   insertFinalNewline: true,
  //   jsdoc: false,
  //   jsxSingleQuote: false,
  //   objectWrap: 'preserve',
  //   // overrides: [],
  //   printWidth: 100,
  //   proseWrap: 'preserve',
  //   quoteProps: 'as-needed',
  //   semi: true,
  //   singleAttributePerLine: false,
  //   singleQuote: true,
  //   sortImports: {
  //     // https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#sortimports-groups
  //     groups: [
  //       'builtin',
  //       // { newlinesBetween: true },
  //       'external',
  //       // { newlinesBetween: true },
  //       'internal',
  //       // { newlinesBetween: true },
  //       ['parent', 'sibling'],
  //       // { newlinesBetween: true },
  //       'index',
  //       // { newlinesBetween: true },
  //       'type',
  //     ],
  //     ignoreCase: true,
  //     internalPattern: ['#/'],
  //     order: 'asc',
  //     newlinesBetween: true,
  //     partitionByComment: false,
  //     partitionByNewline: false,
  //     sortSideEffects: false,
  //   },
  //   sortPackageJson: true,
  //   tabWidth: 2,
  //   trailingComma: 'all',
  //   useTabs: false,
  // }
);
