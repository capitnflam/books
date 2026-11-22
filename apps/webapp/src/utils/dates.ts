import { getLocale } from '#/paraglide/runtime';

/** A date in the current locale, written out: "13 November 2026". */
export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(getLocale(), { dateStyle: 'long' }).format(date);

/** A calendar day (`1937-09-21`) written out in the current locale, the same in any time zone. */
export const formatDay = (day: string) =>
  new Intl.DateTimeFormat(getLocale(), { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${day}T00:00:00Z`),
  );

/** A year, negative before the common era: 1937, "800 BC". */
export function formatYear(year: number) {
  if (year > 0) {
    return String(year);
  }

  // Date counts a year 0, which calendars don't have: 1 BC is 0.
  const date = new Date(0);

  date.setUTCFullYear(year + 1);

  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    era: 'short',
    timeZone: 'UTC',
  }).format(date);
}
