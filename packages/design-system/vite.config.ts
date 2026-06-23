import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // oxlint-disable-next-line typescript/no-unsafe-call
  plugins: [react()],
  build: {
    lib: {
      // Entry point for the library
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@repo/design-system', // Global name for the library
      fileName: (format) => `design-system.${format}.js`,
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
