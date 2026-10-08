import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

const srcRoot = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '#': srcRoot,
      '@books/ui': srcRoot,
    },
  },
  plugins: [tailwindcss(), react()],
  // build: {
  //   lib: {
  //     // Entry point for the library
  //     entry: resolve(import.meta.dirname, 'src/index.ts'),
  //     name: '@books/ui',
  //     // Global name for the library
  //     fileName: (format) => `ui.${format}.js`,
  //   },
  //   rollupOptions: {
  //     // Make sure external dependencies are not bundled into the output
  //     external: ['react', 'react-dom'],
  //     output: {
  //       globals: {
  //         react: 'React',
  //         'react-dom': 'ReactDOM',
  //       },
  //     },
  //   },
  // },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(import.meta.dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
    ],
  },
});
