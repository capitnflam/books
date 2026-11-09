import type { Locale } from '#/paraglide/runtime';

/** A language named in itself ("Deutsch", "Français"), so it can be found whatever the current locale. */
export const localeName = (locale: Locale) => {
  const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;

  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
};

/** Up to two initials, for an avatar without a picture: "Ada Lovelace" → "AL". */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase())
    .join('');
