import { z } from 'zod';

import { CONTRIBUTORS_MAX } from './catalog';
import { genresFromSubjects } from './genres';
import { fromBnf } from './isbn-bnf.server';
import {
  cleanName,
  cleanSubjects,
  compact,
  getJson,
  languageFromMarc,
  publishedFromText,
} from './isbn-source.server';

import type { BookDraft, ContributorForm } from './catalog';
import type { Isbns } from './isbn';
import type { EditionFormat } from '@books/database';

export type LookupOutcome =
  | { status: 'found'; draft: BookDraft }
  | { status: 'not-found' }
  /** The source most likely to know it failed (network error, outage): trying again may work. */
  | { status: 'unavailable' };

const OPEN_LIBRARY = 'https://openlibrary.org';
const GOOGLE_BOOKS = 'https://www.googleapis.com/books/v1/volumes';
const AUTHORS_MAX = 5;

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
    /^(.*?)[\s,;:(-]*(?:#|\b(?:no\.?|vol\.?|volume|book|bk\.?|tome|band))?\s*(\d{1,4}(?:\.\d{1,2})?)\)?\s*$/iu.exec(
      value.trim(),
    );

  return match?.[1]
    ? { series: match[1].trim(), seriesPosition: match[2] ?? '' }
    : { series: value.trim(), seriesPosition: '' };
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
    ].slice(0, CONTRIBUTORS_MAX),
    description: cleanDescription(data.description ?? work?.description),
    firstPublishedYear: firstYear === undefined ? undefined : String(firstYear).slice(0, 4),
    ...seriesFromText(data.series?.[0]),
    genres: genresFromSubjects([...(work?.subjects ?? []), ...(data.subjects ?? [])]),
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
    genres: genresFromSubjects(volume.categories ?? []),
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

/** Details that only make sense with the field they belong to. */
const DETAILS = [
  ['title', 'subtitle'],
  ['series', 'seriesPosition'],
] as const;

/**
 * One draft from what each source found: the first one wins each field and later ones fill the
 * gaps. A subtitle or a position in the series comes only from a source that agrees on the title
 * or series it goes with.
 */
export function mergeDrafts(drafts: readonly BookDraft[]): BookDraft {
  const merged: BookDraft = Object.assign({}, ...drafts.toReversed());

  for (const [field, detail] of DETAILS) {
    const value = merged[field]?.toLowerCase();

    merged[detail] = drafts.find(
      (draft) => draft[detail] !== undefined && draft[field]?.toLowerCase() === value,
    )?.[detail];
  }

  return compact(merged);
}

/** ISBNs of the French-language group (France, Belgium, Quebec…) and, in `979`, of France. */
const isFrench = ({ isbn13 }: Isbns) => /^(?:9782|97910)/u.test(isbn13);

/**
 * Finds a book by ISBN in the open catalogues: first the national library of France when the
 * ISBN is French, then Open Library, then Google Books (when an API key is configured:
 * it refuses anonymous requests) for the fields the others lack.
 */
export async function lookupIsbnOnline(
  isbns: Isbns,
  { googleBooksApiKey }: { googleBooksApiKey?: string } = {},
): Promise<LookupOutcome> {
  const sources = [
    ...(isFrench(isbns) ? [fromBnf(isbns)] : []),
    fromOpenLibrary(isbns),
    ...(googleBooksApiKey ? [fromGoogleBooks(isbns, googleBooksApiKey)] : []),
  ];
  const results = await Promise.allSettled(sources);
  const drafts = results.flatMap((result) =>
    result.status === 'fulfilled' && result.value ? [result.value] : [],
  );

  if (drafts.length === 0) {
    return results[0]?.status === 'rejected' ? { status: 'unavailable' } : { status: 'not-found' };
  }

  return { status: 'found', draft: mergeDrafts(drafts) };
}
