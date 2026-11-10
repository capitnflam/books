import { getCookie } from '@tanstack/react-start/server';

import { THEME_COOKIE_NAME, parseTheme } from './theme';

// Written by `SidebarProvider` in `@books/ui/components/sidebar` whenever the sidebar is toggled.
const SIDEBAR_COOKIE_NAME = 'sidebar_state';

/** Whether the sidebar was left open, so the server renders it the same way. Open by default. */
export async function getSidebarOpenServer() {
  return getCookie(SIDEBAR_COOKIE_NAME) !== 'false';
}

/** The theme the reader chose, written by `ThemeProvider`, so the server renders it. */
export async function getThemeServer() {
  return parseTheme(getCookie(THEME_COOKIE_NAME));
}
