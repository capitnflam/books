import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

import { paraglide } from './vite.paraglide.ts';

export default defineConfig({
  test: {
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        // The pages, in a real browser. Not `vite.config.ts`: the Start plugin would answer the
        // test runner's requests with the app's own server rendering.
        resolve: { tsconfigPaths: true },
        plugins: [
          paraglide(),
          tailwindcss(),
          viteReact(),
          babel({ presets: [reactCompilerPreset()] }),
        ],
        // Transforming imports ahead would reach the server code behind the replaced modules.
        server: { preTransformRequests: false },
        optimizeDeps: {
          // Server code, only reached through the modules `setup.tsx` replaces.
          exclude: ['@books/database', '@clerk/tanstack-react-start', '@tanstack/react-start'],
        },
        test: {
          name: 'pages',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['src/testing/setup.tsx'],
          mockReset: true,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1280, height: 800 },
            screenshotFailures: false,
          },
        },
      },
    ],
  },
});
