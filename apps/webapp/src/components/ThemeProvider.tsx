import { ScriptOnce } from '@tanstack/react-router';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

import { m } from '#/paraglide/messages';
import { DARK_SCHEME_QUERY, THEME_COOKIE_NAME } from '#/services/preferences/theme';

import type { Theme } from '#/services/preferences/theme';
import type { IconName } from '@books/ui/components/icon';
import type { ReactNode } from 'react';

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** The themes in the order the switchers offer them, with how they are shown. */
export const themeOptions: { value: Theme; icon: IconName; label: () => string }[] = [
  { value: 'light', icon: 'sun', label: m.theme_light },
  { value: 'dark', icon: 'moon', label: m.theme_dark },
  { value: 'system', icon: 'device-desktop', label: m.theme_system },
];

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Puts `.dark` (the Lamp palette) on `<html>` when the theme, or the device for `system`, asks for it. */
const applyTheme = (theme: Theme) => {
  const isDark = theme === 'dark' || (theme === 'system' && matchMedia(DARK_SCHEME_QUERY).matches);
  document.documentElement.classList.toggle('dark', isDark);
};

/** `class` for `<html>` as the server renders it: only an explicit Lamp choice is known there. */
export const themeClassName = (theme: Theme) => (theme === 'dark' ? 'dark' : undefined);

/**
 * For `system`, the server can't know the device's preference: this script, placed in `<head>`,
 * applies it before the first paint so the page doesn't flash in the wrong palette.
 */
export function SystemThemeScript({ theme }: { theme: Theme }) {
  if (theme !== 'system') {
    return null;
  }

  return (
    <ScriptOnce>
      {`matchMedia(${JSON.stringify(DARK_SCHEME_QUERY)}).matches&&document.documentElement.classList.add('dark')`}
    </ScriptOnce>
  );
}

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') {
      return;
    }

    // Follow the device when it switches between light and dark, e.g. at sunset.
    const media = matchMedia(DARK_SCHEME_QUERY);
    const onChange = () => applyTheme(theme);
    media.addEventListener('change', onChange);

    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const chooseTheme = useCallback((next: Theme) => {
    document.cookie = `${THEME_COOKIE_NAME}=${next}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
    setTheme(next);
  }, []);
  const value = useMemo(() => ({ theme, setTheme: chooseTheme }), [theme, chooseTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }

  return context;
}
