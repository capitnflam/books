import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

const srcRoot = fileURLToPath(new URL('./src', import.meta.url));

// Every story runs once per theme, so the a11y checks (e.g. color contrast) cover dark mode too.
// `.storybook/preview.tsx` reads STORYBOOK_THEME to pick the theme a story renders in.
const storybookProject = (theme: 'light' | 'dark') => ({
  extends: true,
  plugins: [
    // The plugin will run tests for the stories defined in your Storybook config
    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
    storybookTest({
      configDir: path.join(import.meta.dirname, '.storybook'),
    }),
  ],
  define: {
    'import.meta.env.STORYBOOK_THEME': JSON.stringify(theme),
  },
  test: {
    name: `storybook-${theme}`,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [
        {
          browser: 'chromium' as const,
        },
      ],
    },
  },
});

export default defineConfig({
  resolve: {
    alias: {
      '#': srcRoot,
      '@books/ui': srcRoot,
    },
  },
  plugins: [tailwindcss(), react({})],
  test: {
    projects: [storybookProject('light'), storybookProject('dark')],
  },
});
