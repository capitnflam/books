import { getLocale } from '#/paraglide/runtime';

/** Names as one phrase in the current locale: "Terry Pratchett and Neil Gaiman". */
export const formatList = (names: readonly string[]) =>
  new Intl.ListFormat(getLocale(), { type: 'conjunction' }).format(names);
