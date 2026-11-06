import { withThemeByClassName } from '@storybook/addon-themes';

import type { Preview, ReactRenderer } from '@storybook/react-vite';

import '#/styles/globals.css';

import './preview.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/iu,
        date: /Date$/iu,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },
  },
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: '',
        dark: 'dark',
      },
      // The vitest projects in vite.config.ts set STORYBOOK_THEME to test each theme;
      // the Storybook UI leaves it unset and starts in light.
      defaultTheme: import.meta.env.STORYBOOK_THEME ?? 'light',
    }),
  ],
};

export default preview;
