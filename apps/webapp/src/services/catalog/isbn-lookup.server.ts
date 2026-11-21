import { z } from 'zod';

import type { BookForm, ContributorForm } from './catalog';
import type { Isbns } from './isbn';
import type { EditionFormat } from '@books/database';

/** What a lookup found to prefill the form with; fields it found nothing for are left out. */
export type BookDraft = Partial<Omit<BookForm, 'isbn'>>;

export type LookupOutcome =
  | { status: 'found'; draft: BookDraft }
  | { status: 'not-found' }
  /** Every source failed (network error, outage, quota): trying again later may work. */
  | { status: 'unavailable' };

const OPEN_LIBRARY = 'https://openlibrary.org';
const GOOGLE_BOOKS = 'https://www.googleapis.com/books/v1/volumes';
// Open Library asks automated clients to name themselves.
const USER_AGENT = 'books-catalogue-isbn-lookup/1.0';
const TIMEOUT_MS = 8000;
const SUBJECTS_MAX = 8;
const AUTHORS_MAX = 5;

class SourceUnavailableError extends Error {}

/** The JSON at `url`, or null when it does not exist (404); throws when the source is down. */
async function getJson(url: string): Promise<unknown> {
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

/** Like `getJson`, for the extra details of a book already found: a failure only loses them. */
const getOptionalJson = async (url: string) => getJson(url).catch(() => null);

const text = z.union([z.string(), z.object({ value: z.string() }).transform(({ value }) => value)]);
const keyed = z.object({ key: z.string() });

const openLibraryEdition = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  publishers: z.array(z.string()).optional(),
  publish_date: z.string().optional(),
  number_of_pages: z.number().int().positive().optional(),
  physical_format: z.string().optional(),
  languages: z.array(keyed).optional(),
  covers: z.array(z.number()).optional(),
  works: z.array(keyed).optional(),
  authors: z.array(keyed).optional(),
  contributors: z.array(z.object({ name: z.string(), role: z.string().optional() })).optional(),
  series: z.array(z.string()).optional(),
  edition_name: z.string().optional(),
  description: text.optional(),
  subjects: z.array(z.string()).optional(),
});

const openLibraryWork = z.object({
  description: text.optional(),
  subjects: z.array(z.string()).optional(),
  authors: z.array(z.object({ author: keyed })).optional(),
  first_publish_date: z.string().optional(),
});

const openLibrarySearch = z.object({
  docs: z.array(
    z.object({
      author_name: z.array(z.string()).optional(),
      first_publish_year: z.number().int().optional(),
    }),
  ),
});

const openLibraryAuthor = z.object({ name: z.string() });

const googleBooksVolumes = z.object({
  items: z
    .array(
      z.object({
        volumeInfo: z.object({
          title: z.string().optional(),
          subtitle: z.string().optional(),
          authors: z.array(z.string()).optional(),
          publisher: z.string().optional(),
          publishedDate: z.string().optional(),
          description: z.string().optional(),
          pageCount: z.number().int().positive().optional(),
          categories: z.array(z.string()).optional(),
          language: z.string().optional(),
          imageLinks: z.object({ thumbnail: z.string().optional() }).optional(),
        }),
      }),
    )
    .optional(),
});

/** Open Library's MARC language codes, as BCP 47 tags. */
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

/** Open Library's free-text physical format (`Paperback`, `Audio CD`…), as an edition format. */
export function formatFromText(value: string | undefined): EditionFormat | undefined {
  if (!value) {
    return undefined;
  }

  const format = value.toLowerCase();

  if (format.includes('mass market')) {
    return 'mass_market_paperback';
  }

  if (/paperback|softcover|soft cover|trade paper|broché|taschenbuch/u.test(format)) {
    return 'paperback';
  }

  if (/hardcover|hardback|hard cover|relié|gebunden/u.test(format)) {
    return 'hardcover';
  }

  if (/e-?book|kindle|epub|electronic/u.test(format)) {
    return 'ebook';
  }

  if (/audio/u.test(format)) {
    return 'audiobook';
  }

  return 'other';
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

/** The roles Open Library writes for an edition's other credits, as contributor roles. */
function roleFromText(value: string | undefined): ContributorForm['role'] | undefined {
  const role = value?.toLowerCase() ?? '';

  if (/translat/u.test(role)) {
    return 'translator';
  }

  if (/narrat|read by|reader/u.test(role)) {
    return 'narrator';
  }

  if (/illustrat|artist/u.test(role)) {
    return 'illustrator';
  }

  if (/edit/u.test(role)) {
    return 'editor';
  }

  return /introduc|foreword|preface|afterword/u.test(role) ? 'introduction' : undefined;
}

/** `Discworld -- 1`, `Discworld ; 1`, `Discworld #1` or plain `Discworld`, as name and position. */
export function seriesFromText(
  value: string | undefined,
): { series: string; seriesPosition: string } | undefined {
  if (!value?.trim()) {
    return;
  }

  const match =
    /^(.*?)[\s,;:(-]*(?:#|no\.?|vol\.?|volume|book|tome|band)?\s*(\d{1,4}(?:\.\d{1,2})?)\)?\s*$/iu.exec(
      value.trim(),
    );

  return match?.[1]
    ? { series: match[1].trim(), seriesPosition: match[2] ?? '' }
    : { series: value.trim(), seriesPosition: '' };
}

/** Subjects worth browsing by: no classification codes (`nyt:…`), no long catalogue headings. */
function cleanSubjects(subjects: readonly string[]): string[] {
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

/**
 * A description as plain text: no HTML tags (Google Books), no Markdown emphasis or links and
 * none of the notes appended after a `----------` rule (Open Library).
 */
function cleanDescription(value: string | undefined): string | undefined {
  const description = value
    ?.replaceAll('\r', '')
    .replaceAll(/<br\s*\/?>|<\/p>/giu, '\n')
    .replaceAll(/<[^>]+>/gu, '')
    .split(/\n-{3,}/u)[0]
    ?.replaceAll(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
    .replaceAll(/(\*{1,2}|_{2})(\S(?:.*?\S)?)\1/gu, '$2')
    .trim();

  return description || undefined;
}

/** A name as credited, without the stray spaces some records have. */
const cleanName = (name: string) => name.trim().replaceAll(/\s+/gu, ' ');

function compact(draft: BookDraft): BookDraft {
  return Object.fromEntries(
    Object.entries(draft).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : value !== undefined && value !== '',
    ),
  );
}

async function fromOpenLibrary({ isbn13 }: Isbns): Promise<BookDraft | null> {
  const edition = openLibraryEdition.safeParse(
    await getJson(`${OPEN_LIBRARY}/isbn/${isbn13}.json`),
  );

  if (!edition.success) {
    return null;
  }

  const { data } = edition;
  const workKey = data.works?.[0]?.key;
  const [work, search] = await Promise.all([
    workKey
      ? getOptionalJson(`${OPEN_LIBRARY}${workKey}.json`).then(
          (json) => openLibraryWork.safeParse(json).data,
        )
      : undefined,
    getOptionalJson(
      `${OPEN_LIBRARY}/search.json?isbn=${isbn13}&fields=author_name,first_publish_year&limit=1`,
    ).then((json) => openLibrarySearch.safeParse(json).data?.docs[0]),
  ]);

  let authorNames = search?.author_name ?? [];

  if (authorNames.length === 0) {
    const keys =
      data.authors?.map(({ key }) => key) ?? work?.authors?.map(({ author }) => author.key) ?? [];
    const authors = await Promise.all(
      keys
        .slice(0, AUTHORS_MAX)
        .map(
          async (key) =>
            openLibraryAuthor.safeParse(await getOptionalJson(`${OPEN_LIBRARY}${key}.json`)).data
              ?.name,
        ),
    );

    authorNames = authors.filter((name) => name !== undefined);
  }

  const otherCredits = (data.contributors ?? []).flatMap(({ name, role }) => {
    const credit = roleFromText(role);

    return credit ? [{ name: cleanName(name), role: credit }] : [];
  });
  const cover = data.covers?.find((id) => id > 0);
  const firstYear = search?.first_publish_year ?? publishedFromText(work?.first_publish_date);

  return compact({
    title: data.title,
    subtitle: data.subtitle,
    contributors: [
      ...authorNames
        .slice(0, AUTHORS_MAX)
        .map((name) => ({ name: cleanName(name), role: 'author' as const })),
      ...otherCredits,
    ],
    description: cleanDescription(data.description ?? work?.description),
    firstPublishedYear: firstYear === undefined ? undefined : String(firstYear).slice(0, 4),
    ...seriesFromText(data.series?.[0]),
    subjects: cleanSubjects(work?.subjects ?? data.subjects ?? []).join(', '),
    editionStatement: data.edition_name,
    publisher: data.publishers?.[0],
    published: publishedFromText(data.publish_date),
    language: languageFromMarc(data.languages?.[0]?.key),
    format: formatFromText(data.physical_format),
    pageCount: data.number_of_pages?.toString(),
    coverImageUrl: cover ? `https://covers.openlibrary.org/b/id/${cover}-L.jpg` : undefined,
  });
}

async function fromGoogleBooks({ isbn13 }: Isbns, apiKey: string): Promise<BookDraft | null> {
  const url = new URL(GOOGLE_BOOKS);

  url.searchParams.set('q', `isbn:${isbn13}`);
  url.searchParams.set('key', apiKey);

  const volume = googleBooksVolumes.safeParse(await getJson(url.toString())).data?.items?.[0]
    ?.volumeInfo;

  if (!volume) {
    return null;
  }

  return compact({
    title: volume.title,
    subtitle: volume.subtitle,
    contributors: volume.authors
      ?.slice(0, AUTHORS_MAX)
      .map((name) => ({ name: cleanName(name), role: 'author' })),
    description: cleanDescription(volume.description),
    subjects: cleanSubjects(
      volume.categories?.flatMap((category) => category.split(' / ')) ?? [],
    ).join(', '),
    publisher: volume.publisher,
    published: publishedFromText(volume.publishedDate),
    language: /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/u.test(volume.language ?? '')
      ? volume.language
      : undefined,
    pageCount: volume.pageCount?.toString(),
    coverImageUrl: volume.imageLinks?.thumbnail
      ?.replace(/^http:/u, 'https:')
      .replace('&edge=curl', ''),
  });
}

/**
 * Finds a book by ISBN in the open catalogues: Open Library first, then Google Books (when an
 * API key is configured: it refuses anonymous requests) for the fields Open Library lacks.
 */
export async function lookupIsbnOnline(
  isbns: Isbns,
  { googleBooksApiKey }: { googleBooksApiKey?: string } = {},
): Promise<LookupOutcome> {
  const sources = [
    fromOpenLibrary(isbns),
    ...(googleBooksApiKey ? [fromGoogleBooks(isbns, googleBooksApiKey)] : []),
  ];
  const results = await Promise.allSettled(sources);
  const drafts = results.flatMap((result) =>
    result.status === 'fulfilled' && result.value ? [result.value] : [],
  );

  if (drafts.length === 0) {
    return results.every(({ status }) => status === 'rejected')
      ? { status: 'unavailable' }
      : { status: 'not-found' };
  }

  // The first source wins each field; later ones only fill the gaps.
  return { status: 'found', draft: Object.assign({}, ...drafts.toReversed()) as BookDraft };
}
