import { resolve } from 'path';

/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  build: {
    lib: {
      // Entry point for the library
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@books/shared', // Global name for the library
      fileName: (format) => `shared.${format}.js`,
    },
    rollupOptions: {
      // Make sure external dependencies are not bundled into the output
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  test: {
    typecheck: {
      include: ['**/*.type.spec.ts'],
    },
    include: ['**/(!.type).spec.ts'],
  },
});
