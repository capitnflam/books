import { getLocale } from '#/paraglide/runtime';

/** A date in the current locale, written out: "13 November 2026". */
export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(getLocale(), { dateStyle: 'long' }).format(date);
