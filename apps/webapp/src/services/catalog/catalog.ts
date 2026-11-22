import { z } from 'zod';

import { GENRES } from './genres';
import { parseIsbn } from './isbn';

import type { ContributorRole, EditionFormat, Genre } from '@books/database';

/** Credits offered on the form, in the order the role menu lists them. */
export const CONTRIBUTOR_ROLES = [
  'author',
  'editor',
  'illustrator',
  'introduction',
  'translator',
  'narrator',
] as const satisfies readonly ContributorRole[];

/** Credits that belong to one edition rather than to the work: a translation, a reading. */
const EDITION_ROLES: ReadonlySet<ContributorRole> = new Set(['translator', 'narrator']);

export const isEditionRole = (role: ContributorRole) => EDITION_ROLES.has(role);

export const EDITION_FORMATS = [
  'hardcover',
  'paperback',
  'mass_market_paperback',
  'ebook',
  'audiobook',
  'other',
] as const satisfies readonly EditionFormat[];

/** Languages the language menus offer; a looked-up book in another language adds its own. */
export const LANGUAGE_OPTIONS = [
  'en',
  'fr',
  'de',
  'es',
  'it',
  'pt',
  'nl',
  'sv',
  'da',
  'no',
  'fi',
  'pl',
  'cs',
  'hu',
  'ru',
  'el',
  'la',
  'tr',
  'ar',
  'he',
  'ja',
  'zh',
  'ko',
] as const;

export const BOOK_TITLE_MAX_LENGTH = 500;
export const BOOK_DESCRIPTION_MAX_LENGTH = 10_000;
const NAME_MAX_LENGTH = 200;
const SUBJECT_MAX_LENGTH = 100;
const SUBJECTS_MAX = 20;
export const CONTRIBUTORS_MAX = 20;

export type ContributorForm = { name: string; role: ContributorRole };

/** What the add-book form holds: every field as typed, checked by `createBookSchema`. */
export type BookForm = {
  isbn: string;
  title: string;
  subtitle: string;
  contributors: ContributorForm[];
  description: string;
  originalLanguage: string;
  firstPublishedYear: string;
  series: string;
  seriesPosition: string;
  /** At least one. */
  genres: Genre[];
  /** Comma-separated. */
  subjects: string;
  editionStatement: string;
  publisher: string;
  /** A year, or a full `YYYY-MM-DD` date. */
  published: string;
  language: string;
  format: EditionFormat | '';
  pageCount: string;
  durationMinutes: string;
  coverImageUrl: string;
};

export const emptyContributor = (): ContributorForm => ({ name: '', role: 'author' });

export function emptyBookForm(): BookForm {
  return {
    isbn: '',
    title: '',
    subtitle: '',
    contributors: [emptyContributor()],
    description: '',
    originalLanguage: '',
    firstPublishedYear: '',
    series: '',
    seriesPosition: '',
    genres: [],
    subjects: '',
    editionStatement: '',
    publisher: '',
    published: '',
    language: '',
    format: '',
    pageCount: '',
    durationMinutes: '',
    coverImageUrl: '',
  };
}

/** What an ISBN lookup found to prefill the form with; fields it found nothing for are left out. */
export type BookDraft = Partial<Omit<BookForm, 'isbn'>>;

/**
 * The form once a lookup for `isbn` returned `draft`. Fields the `previous` lookup filled, and
 * that still hold what it put there, are emptied first: looking up a second book must not keep
 * the first one's series or cover. Fields the reader typed or changed are kept, unless the new
 * draft has a value for them.
 */
export function applyLookup(
  form: BookForm,
  previous: BookDraft | null,
  draft: BookDraft,
  isbn: string,
): BookForm {
  const empty = emptyBookForm();
  const next: BookForm = { ...form };

  for (const key of Object.keys(previous ?? {}) as (keyof BookDraft)[]) {
    if (JSON.stringify(form[key]) === JSON.stringify(previous?.[key])) {
      Object.assign(next, { [key]: empty[key] });
    }
  }

  return { ...next, ...draft, isbn };
}

/** Leading articles filed after the title, by language: `The Hobbit` → `Hobbit, The`. */
const ARTICLES: Record<string, readonly string[]> = {
  en: ['the', 'a', 'an'],
  fr: ['le', 'la', 'les', 'l’', "l'", 'un', 'une', 'des'],
  de: ['der', 'die', 'das', 'ein', 'eine'],
  es: ['el', 'la', 'los', 'las', 'un', 'una'],
  it: ['il', 'lo', 'la', 'i', 'gli', 'le', 'l’', "l'", 'un', 'uno', 'una'],
  pt: ['o', 'a', 'os', 'as', 'um', 'uma'],
  nl: ['de', 'het', 'een'],
};

/**
 * The title as filed in an index: a leading article of `language` (English when unknown) moves
 * to the end, so `The Hobbit` files under H and `L’Étranger` under É.
 */
export function sortTitle(title: string, language?: string | null): string {
  const value = title.trim();
  const articles = ARTICLES[language?.split('-')[0]?.toLowerCase() ?? ''] ?? ARTICLES.en ?? [];
  const lower = value.toLowerCase();

  for (const article of articles) {
    const elided = article.endsWith('’') || article.endsWith("'");

    if (elided && lower.startsWith(article) && value.length > article.length) {
      return `${value.slice(article.length)}, ${value.slice(0, article.length)}`;
    }

    if (!elided && lower.startsWith(`${article} `) && value.length > article.length + 1) {
      return `${value.slice(article.length + 1).trimStart()}, ${value.slice(0, article.length)}`;
    }
  }

  return value;
}

/** Name particles filed with the surname: `Le Guin`, `van Gogh`, `de Beauvoir`. */
const PARTICLES = new Set([
  'al',
  'bin',
  'da',
  'de',
  'del',
  'della',
  'den',
  'der',
  'des',
  'di',
  'du',
  'el',
  'ibn',
  'la',
  'le',
  'st.',
  'ten',
  'ter',
  'van',
  'von',
]);

const SUFFIXES = new Set(['jr.', 'jr', 'sr.', 'sr', 'ii', 'iii', 'iv']);

/** The name as filed in an index: `Ursula K. Le Guin` → `Le Guin, Ursula K.`. */
export function sortName(name: string): string {
  const value = name.trim().replaceAll(/\s+/gu, ' ');

  if (value.includes(',')) {
    return value;
  }

  const words = value.split(' ');
  const suffix = words.length > 2 && SUFFIXES.has(words.at(-1)!.toLowerCase()) ? words.pop() : null;

  if (words.length < 2) {
    return value;
  }

  let start = words.length - 1;

  while (start > 1 && PARTICLES.has(words[start - 1]!.toLowerCase())) {
    start -= 1;
  }

  const surname = words.slice(start).join(' ');
  const given = words.slice(0, start).join(' ');

  return suffix ? `${surname}, ${given}, ${suffix}` : `${surname}, ${given}`;
}

const trimmed = (max: number) => z.string().trim().max(max);

/** An empty field is no value. */
const optionalText = (max: number) => trimmed(max).transform((value) => value || null);

const optionalInteger = (min: number, max: number) =>
  z
    .string()
    .trim()
    .regex(/^-?\d*$/u)
    .transform((value) => (value ? Number(value) : null))
    .pipe(z.number().int().min(min).max(max).nullable());

/** A BCP 47 language tag such as `en` or `fr-CA`. */
const optionalLanguage = z
  .string()
  .trim()
  .regex(/^(?:[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*)?$/u)
  .transform((value) => value || null);

const isRealDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

/** A year, or a full date whose year is then the published year. */
const published = z
  .string()
  .trim()
  .refine((value) => !value || /^\d{1,4}$/u.test(value) || /^\d{4}-\d{2}-\d{2}$/u.test(value))
  .refine((value) => !value.includes('-') || isRealDate(value))
  .transform((value) => ({
    publishedYear: value ? Number(value.split('-')[0]) : null,
    publishedOn: value.includes('-') ? value : null,
  }))
  .refine(({ publishedYear }) => publishedYear === null || publishedYear <= 9999);

/** Only the length the chosen format shows counts: running time for audiobooks, pages otherwise. */
function dropHiddenLength(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  return (value as Partial<BookForm>).format === 'audiobook'
    ? { ...value, pageCount: '' }
    : { ...value, durationMinutes: '' };
}

/** Next year at the latest: books are announced before they come out. Read on every check. */
const isNotTooLate = (year: number | null) => year === null || year <= new Date().getFullYear() + 1;

const bookSchema = z
  .object({
    isbn: z
      .string()
      .trim()
      .refine((value) => !value || parseIsbn(value) !== null)
      .transform((value) => (value ? parseIsbn(value) : null)),
    title: trimmed(BOOK_TITLE_MAX_LENGTH).min(1),
    subtitle: optionalText(BOOK_TITLE_MAX_LENGTH),
    contributors: z
      .array(
        z.object({
          name: trimmed(NAME_MAX_LENGTH),
          role: z.enum(CONTRIBUTOR_ROLES),
        }),
      )
      .max(CONTRIBUTORS_MAX)
      // A row left empty is no credit.
      .transform((rows) => rows.filter(({ name }) => name)),
    description: optionalText(BOOK_DESCRIPTION_MAX_LENGTH),
    originalLanguage: optionalLanguage,
    firstPublishedYear: optionalInteger(-3000, 9999).refine(isNotTooLate),
    series: optionalText(NAME_MAX_LENGTH),
    seriesPosition: z
      .string()
      .trim()
      .regex(/^(?:\d{1,4}(?:[.,]\d{1,2})?)?$/u)
      .transform((value) => (value ? Number(value.replace(',', '.')) : null)),
    genres: z
      .array(z.enum(GENRES))
      .min(1)
      .transform((genres) => [...new Set(genres)]),
    subjects: z
      .string()
      .transform((value) => {
        const seen = new Set<string>();

        return value
          .split(',')
          .map((subject) => subject.trim().replaceAll(/\s+/gu, ' '))
          .filter((subject) => {
            const key = subject.toLowerCase();
            const isNew = subject !== '' && !seen.has(key);

            seen.add(key);

            return isNew;
          });
      })
      .pipe(z.array(z.string().max(SUBJECT_MAX_LENGTH)).max(SUBJECTS_MAX)),
    editionStatement: optionalText(NAME_MAX_LENGTH),
    publisher: optionalText(NAME_MAX_LENGTH),
    published,
    language: optionalLanguage,
    format: z.union([z.enum(EDITION_FORMATS), z.literal('').transform(() => null)]),
    pageCount: optionalInteger(1, 100_000),
    durationMinutes: optionalInteger(1, 100_000),
    coverImageUrl: z.union([
      z.literal('').transform(() => null),
      z.url({ protocol: /^https?$/u }).max(2000),
    ]),
  })
  // A position means nothing without the series it is a position in.
  .refine(({ series, seriesPosition }) => series !== null || seriesPosition === null, {
    path: ['seriesPosition'],
  });

/** The form as the server saves it; the hidden page count or running time is dropped first. */
export const createBookSchema = z.preprocess(dropHiddenLength, bookSchema);

export type CreateBookInput = z.output<typeof createBookSchema>;

/**
 * Where the form shows an error at `path`: on the field, even for an item inside a list (a
 * subject too long is `subjects`), except a contributor's own row (`contributors.0.name`).
 */
function errorField(path: readonly PropertyKey[]): string {
  return path[0] === 'contributors' && path.length >= 3
    ? path.slice(0, 3).join('.')
    : String(path[0]);
}

/**
 * The fields of `form` that the server would refuse, as the form's field names (`title`,
 * `subjects`) or contributor rows (`contributors.0.name`), so it can mark them before sending.
 */
export function bookFormErrors(form: BookForm): Set<string> {
  const result = createBookSchema.safeParse(form);

  return new Set(result.success ? [] : result.error.issues.map(({ path }) => errorField(path)));
}

export const lookupIsbnSchema = z.object({ isbn: z.string().trim().min(1).max(32) });
