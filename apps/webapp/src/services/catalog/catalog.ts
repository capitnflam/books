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

/** Credits offered when editing a work. */
export const WORK_CREDIT_ROLES = CONTRIBUTOR_ROLES.filter((role) => !isEditionRole(role));

/** Credits offered when editing an edition: an illustrator can be one edition's too. */
export const EDITION_CREDIT_ROLES = [
  ...CONTRIBUTOR_ROLES.filter((role) => isEditionRole(role)),
  ...CONTRIBUTOR_ROLES.filter((role) => !isEditionRole(role) && role !== 'author'),
];

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
export const SERIES_MAX = 10;

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

/** The fields about the work that the add and edit forms share. */
export type WorkValues = Pick<
  BookForm,
  | 'title'
  | 'subtitle'
  | 'contributors'
  | 'description'
  | 'originalLanguage'
  | 'firstPublishedYear'
  | 'genres'
  | 'subjects'
>;

/** The fields about one edition that the add and edit forms share. */
export type EditionValues = Pick<
  BookForm,
  | 'editionStatement'
  | 'publisher'
  | 'published'
  | 'language'
  | 'format'
  | 'pageCount'
  | 'durationMinutes'
  | 'coverImageUrl'
>;

export const emptyContributor = (role: ContributorRole = 'author'): ContributorForm => ({
  name: '',
  role,
});

export type SeriesForm = { name: string; position: string };

export const emptySeries = (): SeriesForm => ({ name: '', position: '' });

/** What the edit-book form holds. A book can be in several series, though it is added to one. */
export type WorkForm = WorkValues & { series: SeriesForm[] };

/** What the edit-edition form holds; its title and subtitle only when they differ from the book's. */
export type EditionForm = EditionValues
  & Pick<BookForm, 'isbn' | 'title' | 'subtitle' | 'contributors'>;

export const emptyWorkValues = (): WorkValues => ({
  title: '',
  subtitle: '',
  contributors: [emptyContributor()],
  description: '',
  originalLanguage: '',
  firstPublishedYear: '',
  genres: [],
  subjects: '',
});

export const emptyEditionValues = (): EditionValues => ({
  editionStatement: '',
  publisher: '',
  published: '',
  language: '',
  format: '',
  pageCount: '',
  durationMinutes: '',
  coverImageUrl: '',
});

export const emptyBookForm = (): BookForm => ({
  isbn: '',
  ...emptyWorkValues(),
  series: '',
  seriesPosition: '',
  ...emptyEditionValues(),
});

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

const contributors = z
  .array(
    z.object({
      name: trimmed(NAME_MAX_LENGTH),
      role: z.enum(CONTRIBUTOR_ROLES),
    }),
  )
  .max(CONTRIBUTORS_MAX)
  // A row left empty is no credit.
  .transform((rows) => rows.filter(({ name }) => name));

const seriesPosition = z
  .string()
  .trim()
  .regex(/^(?:\d{1,4}(?:[.,]\d{1,2})?)?$/u)
  .transform((value) => (value ? Number(value.replace(',', '.')) : null));

const workShape = {
  title: trimmed(BOOK_TITLE_MAX_LENGTH).min(1),
  subtitle: optionalText(BOOK_TITLE_MAX_LENGTH),
  contributors,
  description: optionalText(BOOK_DESCRIPTION_MAX_LENGTH),
  originalLanguage: optionalLanguage,
  firstPublishedYear: optionalInteger(-3000, 9999).refine(isNotTooLate),
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
};

const editionShape = {
  isbn: z
    .string()
    .trim()
    .refine((value) => !value || parseIsbn(value) !== null)
    .transform((value) => (value ? parseIsbn(value) : null)),
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
};

const bookSchema = z
  .object({
    ...workShape,
    series: optionalText(NAME_MAX_LENGTH),
    seriesPosition,
    ...editionShape,
  })
  // A position means nothing without the series it is a position in.
  .refine(({ series, seriesPosition: position }) => series !== null || position === null, {
    path: ['seriesPosition'],
  });

/** The form as the server saves it; the hidden page count or running time is dropped first. */
export const createBookSchema = z.preprocess(dropHiddenLength, bookSchema);

export type CreateBookInput = z.output<typeof createBookSchema>;

const workFormSchema = z.object({
  ...workShape,
  series: z
    .array(
      z
        .object({ name: trimmed(NAME_MAX_LENGTH), position: seriesPosition })
        .refine(({ name, position }) => name !== '' || position === null, { path: ['name'] }),
    )
    .max(SERIES_MAX)
    .transform((rows) => rows.filter(({ name }) => name)),
});

const editionFormSchema = z.object({
  ...editionShape,
  title: optionalText(BOOK_TITLE_MAX_LENGTH),
  subtitle: optionalText(BOOK_TITLE_MAX_LENGTH),
  contributors,
});

export const bookIdSchema = z.object({ bookId: z.uuid() });

const editionIdSchema = z.object({ editionId: z.uuid() });

export const updateBookSchema = workFormSchema.extend(bookIdSchema.shape);

export type UpdateBookInput = z.output<typeof updateBookSchema>;

export const updateEditionSchema = z.preprocess(
  dropHiddenLength,
  editionFormSchema.extend(editionIdSchema.shape),
);

export type UpdateEditionInput = z.output<typeof updateEditionSchema>;

/**
 * Where the form shows an error at `path`: on the field, even for an item inside a list (a
 * subject too long is `subjects`), except a row's own field (`contributors[0].name`).
 */
function errorField(path: readonly PropertyKey[]): string {
  return (path[0] === 'contributors' || path[0] === 'series') && path.length >= 3
    ? `${String(path[0])}[${String(path[1])}].${String(path[2])}`
    : String(path[0]);
}

const fieldErrors = (schema: z.ZodType, form: unknown): Set<string> => {
  const result = schema.safeParse(form);

  return new Set(result.success ? [] : result.error.issues.map(({ path }) => errorField(path)));
};

/**
 * The fields of `form` that the server would refuse, as the form's field names (`title`,
 * `subjects`) or rows (`contributors[0].name`), so it can mark them before sending.
 */
export const bookFormErrors = (form: BookForm) => fieldErrors(createBookSchema, form);

/** The same for the edit-book form. */
export const workFormErrors = (form: WorkForm) => fieldErrors(workFormSchema, form);

/** The same for the edit-edition form. */
export const editionFormErrors = (form: EditionForm) =>
  fieldErrors(z.preprocess(dropHiddenLength, editionFormSchema), form);

type SavedCredit = { role: ContributorRole; author: { name: string } };

const creditRows = (credits: readonly SavedCredit[], role: ContributorRole | undefined) =>
  credits.length > 0
    ? credits.map((credit) => ({ name: credit.author.name, role: credit.role }))
    : [emptyContributor(role)];

/** A saved book, as the edit-book form shows it. */
export function workFormOf(book: {
  title: string;
  subtitle: string | null;
  description: string | null;
  originalLanguage: string | null;
  firstPublishedYear: number | null;
  contributors: readonly SavedCredit[];
  series: readonly { position: number | null; series: { name: string } }[];
  genres: readonly Genre[];
  subjects: readonly { name: string }[];
}): WorkForm {
  return {
    title: book.title,
    subtitle: book.subtitle ?? '',
    contributors: creditRows(book.contributors, WORK_CREDIT_ROLES[0]),
    description: book.description ?? '',
    originalLanguage: book.originalLanguage ?? '',
    firstPublishedYear: book.firstPublishedYear?.toString() ?? '',
    series:
      book.series.length > 0
        ? book.series.map(({ position, series }) => ({
            name: series.name,
            position: position?.toString() ?? '',
          }))
        : [emptySeries()],
    genres: [...book.genres],
    subjects: book.subjects.map(({ name }) => name).join(', '),
  };
}

/** A saved edition, as the edit-edition form shows it. */
export function editionFormOf(edition: {
  title: string | null;
  subtitle: string | null;
  editionStatement: string | null;
  publisher: { name: string } | null;
  publishedYear: number | null;
  publishedOn: string | null;
  isbn13: string | null;
  isbn10: string | null;
  language: string | null;
  format: EditionFormat | null;
  pageCount: number | null;
  durationMinutes: number | null;
  coverImageUrl: string | null;
  contributors: readonly SavedCredit[];
}): EditionForm {
  return {
    isbn: edition.isbn13 ?? edition.isbn10 ?? '',
    title: edition.title ?? '',
    subtitle: edition.subtitle ?? '',
    contributors: creditRows(edition.contributors, EDITION_CREDIT_ROLES[0]),
    editionStatement: edition.editionStatement ?? '',
    publisher: edition.publisher?.name ?? '',
    published: edition.publishedOn ?? edition.publishedYear?.toString() ?? '',
    language: edition.language ?? '',
    format: edition.format ?? '',
    pageCount: edition.pageCount?.toString() ?? '',
    durationMinutes: edition.durationMinutes?.toString() ?? '',
    coverImageUrl: edition.coverImageUrl ?? '',
  };
}

type FiledTitle = { title: string; originalLanguage: string | null };
type TitledEdition = { title: string | null; language: string | null };

/**
 * The language a book's title is in, so the one whose leading article is moved: that of the
 * first edition printed under it, as when a book is added, or else the original language.
 */
const titleLanguage = ({ originalLanguage }: FiledTitle, editions: readonly TitledEdition[]) =>
  editions.find(({ title, language }) => title === null && language !== null)?.language
  ?? originalLanguage;

/**
 * Where a book is filed once it, or the language of its editions, changed. One that was filed
 * elsewhere than `sortTitle` would file it stays there until its title changes.
 */
export function refiledTitle(
  before: FiledTitle & { sortTitle: string; editions: readonly TitledEdition[] },
  after: FiledTitle & { editions: readonly TitledEdition[] },
): string {
  const filedByHand =
    before.sortTitle !== sortTitle(before.title, titleLanguage(before, before.editions));

  return filedByHand && before.title === after.title
    ? before.sortTitle
    : sortTitle(after.title, titleLanguage(after, after.editions));
}

export const lookupIsbnSchema = z.object({ isbn: z.string().trim().min(1).max(32) });
