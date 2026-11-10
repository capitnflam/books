/**
 * The reader's colour theme: Day (light), Lamp (dark), or whichever the device prefers.
 * Kept in a cookie so the server renders the page in the chosen theme.
 */
const themes = ['light', 'dark', 'system'] as const;

export type Theme = (typeof themes)[number];

export const THEME_COOKIE_NAME = 'theme';

/** Media query matching a device set to a dark appearance. */
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** Reads a stored theme, falling back to the device's preference for a missing or unknown value. */
export const parseTheme = (value: string | undefined): Theme =>
  themes.includes(value as Theme) ? (value as Theme) : 'system';
