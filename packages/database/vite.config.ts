import { resolve } from 'path'

import { defineConfig } from 'vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  build: {
    lib: {
      // Entry point for the library
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@repo/database', // Global name for the library
      fileName: (format) => `database.${format}.js`,
    },
    rollupOptions: {
      // Make sure external dependencies are not bundled into the output
      external: ['react', 'react-dom'],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
