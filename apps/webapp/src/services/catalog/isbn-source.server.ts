// What the catalogues asked by the ISBN lookup have in common.

import type { BookDraft } from './catalog';

// Open Library asks automated clients to name themselves.
const USER_AGENT = 'books-catalogue-isbn-lookup/1.0';
const TIMEOUT_MS = 8000;
const SUBJECTS_MAX = 8;

class SourceUnavailableError extends Error {}

/** The JSON at `url`, or null when it does not exist (404); throws when the source is down. */
export async function getJson(url: string): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new SourceUnavailableError(`Could not reach ${new URL(url).host}`, { cause: error });
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new SourceUnavailableError(`${new URL(url).host} answered ${response.status}`);
  }

  return response.json();
}

/** Libraries' MARC language codes, as BCP 47 tags. */
const MARC_LANGUAGES: Record<string, string> = {
  ara: 'ar',
  chi: 'zh',
  cze: 'cs',
  dan: 'da',
  dut: 'nl',
  eng: 'en',
  fin: 'fi',
  fre: 'fr',
  ger: 'de',
  gre: 'el',
  heb: 'he',
  hun: 'hu',
  ita: 'it',
  jpn: 'ja',
  kor: 'ko',
  lat: 'la',
  nob: 'no',
  nor: 'no',
  pol: 'pl',
  por: 'pt',
  rus: 'ru',
  spa: 'es',
  swe: 'sv',
  tur: 'tr',
};

export function languageFromMarc(key: string | undefined): string | undefined {
  return key ? MARC_LANGUAGES[key.split('/').at(-1) ?? ''] : undefined;
}

const MONTH_NAME = /\p{L}{3,}/u;

/**
 * A publication date as sources write it (`1991`, `Sep 21, 1991`, `1991-09-21`), as the form's
 * `published` field: the full date when the day is known, otherwise the year.
 */
export function publishedFromText(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/u.test(trimmed)) {
    return trimmed;
  }

  // Any four digits standing alone: `c1991` (copyright) and `[1991?]` are common.
  const year = /(?<!\d)(\d{4})(?!\d)/u.exec(trimmed)?.[1];

  if (!year) {
    return undefined;
  }

  // `September 21, 1991` or `21 September 1991`: a month name and a day as well as the year.
  const day = /\b(\d{1,2})\b/u.exec(trimmed.replace(year, ''));
  const parsed = new Date(trimmed);

  if (day && MONTH_NAME.test(trimmed) && String(parsed.getFullYear()) === year) {
    const month = String(parsed.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}-${String(parsed.getDate()).padStart(2, '0')}`;
  }

  return year;
}

/** Subjects worth browsing by: no classification codes (`nyt:…`), no long catalogue headings. */
export function cleanSubjects(subjects: readonly string[]): string[] {
  const seen = new Set<string>();

  return subjects
    .map((subject) => subject.trim())
    .filter((subject) => {
      const key = subject.toLowerCase();
      const keep =
        subject.length > 0
        && subject.length <= 40
        && !/[:=]/u.test(subject)
        && !subject.includes(',')
        && !seen.has(key);

      seen.add(key);

      return keep;
    })
    .slice(0, SUBJECTS_MAX);
}

/** A name as credited, without the stray spaces some records have. */
export const cleanName = (name: string) => name.trim().replaceAll(/\s+/gu, ' ');

export function compact(draft: BookDraft): BookDraft {
  return Object.fromEntries(
    Object.entries(draft).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : value !== undefined && value !== '',
    ),
  );
}
