import { paraglideVitePlugin } from '@inlang/paraglide-js';

/** Compiles the messages, for the app and for its tests. */
export const paraglide = () =>
  paraglideVitePlugin({
    project: './project.inlang',
    outdir: './src/paraglide',
    strategy: ['url', 'baseLocale'],
    emitTsDeclarations: true,
  });
