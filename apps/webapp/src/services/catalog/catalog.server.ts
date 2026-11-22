import { db, orm, schema } from '@books/database';

import { requirePermissionServer } from '#/services/access/access.server';

import { isEditionRole, refiledTitle, sortName, sortTitle } from './catalog';
import { parseIsbn } from './isbn';
import { lookupIsbnOnline } from './isbn-lookup.server';

import type {
  BookDraft,
  CreateBookInput,
  CreateEditionInput,
  UpdateBookInput,
  UpdateEditionInput,
} from './catalog';
import type { Isbns } from './isbn';
import type { ContributorRole } from '@books/database';

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** The catalogued edition, other than `exceptId`, with one of these ISBNs, and its book's title. */
async function findEditionByIsbnServer({ isbn13, isbn10 }: Isbns, exceptId?: string) {
  const [edition] = await db
    .select({ bookId: schema.editions.bookId, title: schema.books.title })
    .from(schema.editions)
    .innerJoin(schema.books, orm.eq(schema.books.id, schema.editions.bookId))
    .where(
      orm.and(
        orm.or(
          orm.eq(schema.editions.isbn13, isbn13),
          isbn10 ? orm.eq(schema.editions.isbn10, isbn10) : undefined,
        ),
        exceptId ? orm.ne(schema.editions.id, exceptId) : undefined,
      ),
    )
    .limit(1);

  return edition ?? null;
}

export type IsbnLookupResult =
  | { status: 'invalid' }
  | { status: 'exists'; bookId: string; title: string }
  | { status: 'found'; isbn: string; draft: BookDraft }
  | { status: 'not-found'; isbn: string }
  | { status: 'unavailable'; isbn: string };

/**
 * What the add-book form can prefill for an ISBN: the edition already in the catalogue, or
 * what the open catalogues know about it. `isbn` is its ISBN-13, the form the form keeps.
 */
export async function lookupIsbnServer(
  input: string,
  options: { googleBooksApiKey?: string },
): Promise<IsbnLookupResult> {
  await requirePermissionServer('catalog:manage');

  const isbns = parseIsbn(input);

  if (!isbns) {
    return { status: 'invalid' };
  }

  const existing = await findEditionByIsbnServer(isbns);

  if (existing) {
    return { status: 'exists', ...existing };
  }

  const outcome = await lookupIsbnOnline(isbns, options);

  return { ...outcome, isbn: isbns.isbn13 };
}

/** The id of the author with exactly this name (ignoring case), created when there is none. */
async function findOrCreateAuthor(tx: Transaction, name: string) {
  const [existing] = await tx
    .select({ id: schema.authors.id })
    .from(schema.authors)
    .where(orm.sql`lower(${schema.authors.name}) = lower(${name})`)
    .orderBy(orm.asc(schema.authors.createdAt))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const [created] = await tx
    .insert(schema.authors)
    .values({ name, sortName: sortName(name) })
    .returning({ id: schema.authors.id });

  return created!.id;
}

async function findOrCreateSeries(tx: Transaction, name: string, language: string | null) {
  const [existing] = await tx
    .select({ id: schema.series.id })
    .from(schema.series)
    .where(orm.sql`lower(${schema.series.name}) = lower(${name})`)
    .orderBy(orm.asc(schema.series.createdAt))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const [created] = await tx
    .insert(schema.series)
    .values({ name, sortName: sortTitle(name, language) })
    .returning({ id: schema.series.id });

  return created!.id;
}

/**
 * The ids of the publishers or subjects named `names`, ignoring case like authors and series
 * (`Fantasy` reuses `fantasy`), creating those that don't exist yet. Where rows differing only
 * by case already exist, the oldest is used.
 */
async function findOrCreateNamed(
  tx: Transaction,
  table: typeof schema.publishers | typeof schema.subjects,
  names: string[],
) {
  if (names.length === 0) {
    return [];
  }

  const idsByName = async () => {
    const rows = await tx
      .select({ id: table.id, name: table.name })
      .from(table)
      .where(
        orm.inArray(
          orm.sql`lower(${table.name})`,
          names.map((name) => name.toLowerCase()),
        ),
      )
      .orderBy(orm.asc(table.createdAt));
    const ids = new Map<string, string>();

    for (const { id, name } of rows) {
      if (!ids.has(name.toLowerCase())) {
        ids.set(name.toLowerCase(), id);
      }
    }

    return ids;
  };

  let ids = await idsByName();
  const missing = names.filter((name) => !ids.has(name.toLowerCase()));

  if (missing.length > 0) {
    // `on conflict` covers another save creating the same name meanwhile.
    await tx
      .insert(table)
      .values(missing.map((name) => ({ name })))
      .onConflictDoNothing({ target: table.name });
    ids = await idsByName();
  }

  return names.flatMap((name) => ids.get(name.toLowerCase()) ?? []);
}

type Credit = { authorId: string; role: ContributorRole };

/**
 * The credits entered as names, in the order they were entered; the same person twice in the
 * same role is one credit. `known` holds the authors already credited, by name in lower case:
 * they are kept rather than looked up, so a homonym doesn't take their place.
 */
async function resolveCredits(
  tx: Transaction,
  contributors: readonly { name: string; role: ContributorRole }[],
  known: ReadonlyMap<string, string> = new Map(),
) {
  const credits: Credit[] = [];
  const credited = new Set<string>();
  // Someone credited twice (author and illustrator) is looked up once.
  const authorIds = new Map(known);

  for (const { name, role } of contributors) {
    const authorId = authorIds.get(name.toLowerCase()) ?? (await findOrCreateAuthor(tx, name));

    authorIds.set(name.toLowerCase(), authorId);
    const key = `${authorId}:${role}`;

    if (!credited.has(key)) {
      credited.add(key);
      credits.push({ authorId, role });
    }
  }

  return credits;
}

/** The authors of saved credits, by name in lower case. */
const authorsByName = (credits: readonly { author: { id: string; name: string } }[]) =>
  new Map(credits.map(({ author }) => [author.name.toLowerCase(), author.id]));

async function insertBookCredits(tx: Transaction, bookId: string, credits: readonly Credit[]) {
  if (credits.length > 0) {
    await tx
      .insert(schema.bookContributors)
      .values(credits.map((credit, position) => ({ bookId, ...credit, position })));
  }
}

async function insertEditionCredits(
  tx: Transaction,
  editionId: string,
  credits: readonly Credit[],
) {
  if (credits.length > 0) {
    await tx
      .insert(schema.editionContributors)
      .values(credits.map((credit, position) => ({ editionId, ...credit, position })));
  }
}

async function insertGenresAndSubjects(
  tx: Transaction,
  bookId: string,
  { genres, subjects }: Pick<UpdateBookInput, 'genres' | 'subjects'>,
) {
  // The schemas require at least one genre.
  await tx.insert(schema.bookGenres).values(genres.map((genre) => ({ bookId, genre })));

  const subjectIds = await findOrCreateNamed(tx, schema.subjects, subjects);

  if (subjectIds.length > 0) {
    await tx
      .insert(schema.bookSubjects)
      .values(subjectIds.map((subjectId) => ({ bookId, subjectId })));
  }
}

/** The columns of an edition that every form with one has, its publisher found or created. */
async function editionValues(
  tx: Transaction,
  edition: Omit<UpdateEditionInput, 'editionId' | 'title' | 'subtitle' | 'contributors'>,
) {
  const [publisherId] = await findOrCreateNamed(
    tx,
    schema.publishers,
    edition.publisher ? [edition.publisher] : [],
  );

  return {
    editionStatement: edition.editionStatement,
    publisherId: publisherId ?? null,
    publishedYear: edition.published.publishedYear,
    publishedOn: edition.published.publishedOn,
    isbn13: edition.isbn?.isbn13 ?? null,
    isbn10: edition.isbn?.isbn10 ?? null,
    language: edition.language,
    format: edition.format,
    pageCount: edition.pageCount,
    durationMinutes: edition.durationMinutes,
    coverImageUrl: edition.coverImageUrl,
  };
}

const isUniqueViolation = (error: unknown) =>
  error instanceof Error
  && ((error as { code?: unknown }).code === '23505'
    || (error.cause as { code?: unknown } | undefined)?.code === '23505');

/**
 * Runs `save`, unless an edition other than `exceptId` has the ISBN, or takes it meanwhile:
 * the answer is then that edition's book.
 */
async function saveUnlessIsbnTaken<Saved>(
  isbn: Isbns | null,
  save: () => Promise<Saved>,
  exceptId?: string,
) {
  const findTaken = async () => (isbn ? findEditionByIsbnServer(isbn, exceptId) : null);
  const taken = await findTaken();

  if (taken) {
    return { error: 'isbn-taken' as const, ...taken };
  }

  try {
    return await save();
  } catch (error) {
    // Another edition took the ISBN between the check and the save.
    const takenMeanwhile = isUniqueViolation(error) ? await findTaken() : null;

    if (takenMeanwhile) {
      return { error: 'isbn-taken' as const, ...takenMeanwhile };
    }

    throw error;
  }
}

/**
 * Adds a book and its edition to the catalogue, with their credits, publisher, series, genres
 * and subjects; reuses the authors, publisher, series and subjects that already exist by name.
 * Refuses an ISBN another edition already has.
 */
export async function createBookServer(book: CreateBookInput) {
  await requirePermissionServer('catalog:manage');

  // The title and series name are as printed on this edition (often what the lookup found), so
  // their leading article is the edition's language's: "Le Seigneur des anneaux" files under S.
  const language = book.language ?? book.originalLanguage;

  return saveUnlessIsbnTaken(book.isbn, async () => {
    const bookId = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(schema.books)
        .values({
          title: book.title,
          subtitle: book.subtitle,
          sortTitle: sortTitle(book.title, language),
          description: book.description,
          originalLanguage: book.originalLanguage,
          firstPublishedYear: book.firstPublishedYear,
        })
        .returning({ id: schema.books.id });
      const { id } = created!;

      const [edition] = await tx
        .insert(schema.editions)
        .values({ bookId: id, ...(await editionValues(tx, book)) })
        .returning({ id: schema.editions.id });

      const credits = await resolveCredits(tx, book.contributors);

      // Numbered apart for the book and the edition.
      await insertBookCredits(
        tx,
        id,
        credits.filter(({ role }) => !isEditionRole(role)),
      );
      await insertEditionCredits(
        tx,
        edition!.id,
        credits.filter(({ role }) => isEditionRole(role)),
      );

      if (book.series) {
        await tx.insert(schema.bookSeries).values({
          bookId: id,
          seriesId: await findOrCreateSeries(tx, book.series, language),
          position: book.seriesPosition,
        });
      }

      await insertGenresAndSubjects(tx, id, book);

      return id;
    });

    return { error: null, bookId, title: book.title };
  });
}

/**
 * Takes the lock every edit of a book or of its editions holds, so two at once follow each
 * other instead of mixing their credits. Returns the book as it was, or null when it's gone.
 */
async function lockBook(tx: Transaction, bookId: string) {
  const [locked] = await tx
    .select({ id: schema.books.id })
    .from(schema.books)
    .where(orm.eq(schema.books.id, bookId))
    .for('update');

  if (!locked) {
    return null;
  }

  const book = await tx.query.books.findFirst({
    where: orm.eq(schema.books.id, bookId),
    with: {
      contributors: { with: { author: true } },
      series: { with: { series: true } },
      editions: {
        orderBy: orm.asc(schema.editions.createdAt),
        with: { contributors: { with: { author: true } } },
      },
    },
  });

  return book ?? null;
}

type LockedBook = NonNullable<Awaited<ReturnType<typeof lockBook>>>;

/** Files a book under its title again: the language of its `editions` decides which article moves. */
async function refileBook(
  tx: Transaction,
  book: LockedBook,
  editions: readonly { title: string | null; language: string | null }[],
) {
  const sortTitleAfter = refiledTitle(book, { ...book, editions });

  if (sortTitleAfter !== book.sortTitle) {
    await tx
      .update(schema.books)
      .set({ sortTitle: sortTitleAfter })
      .where(orm.eq(schema.books.id, book.id));
  }
}

/** Saves the edit-book form: the work itself, with its credits, series, genres and subjects. */
export async function updateBookServer({ bookId, ...book }: UpdateBookInput) {
  await requirePermissionServer('catalog:manage');

  return db.transaction(async (tx) => {
    const before = await lockBook(tx, bookId);

    if (!before) {
      return { error: 'not-found' as const };
    }

    await tx
      .update(schema.books)
      .set({
        title: book.title,
        subtitle: book.subtitle,
        sortTitle: refiledTitle(before, { ...book, editions: before.editions }),
        description: book.description,
        originalLanguage: book.originalLanguage,
        firstPublishedYear: book.firstPublishedYear,
      })
      .where(orm.eq(schema.books.id, bookId));

    const credits = await resolveCredits(tx, book.contributors, authorsByName(before.contributors));

    await tx.delete(schema.bookContributors).where(orm.eq(schema.bookContributors.bookId, bookId));
    await insertBookCredits(tx, bookId, credits);

    const knownSeries = new Map(
      before.series.map(({ series }) => [series.name.toLowerCase(), series.id]),
    );
    // Keyed by series, so one entered twice is kept once, with its first number.
    const positions = new Map<string, number | null>();

    for (const { name, position } of book.series) {
      const seriesId =
        knownSeries.get(name.toLowerCase())
        // As when a book is added, filed by the articles of the language of the edition.
        ?? (await findOrCreateSeries(
          tx,
          name,
          before.editions.find(({ language }) => language)?.language ?? book.originalLanguage,
        ));

      if (!positions.has(seriesId)) {
        positions.set(seriesId, position);
      }
    }

    await tx.delete(schema.bookSeries).where(orm.eq(schema.bookSeries.bookId, bookId));

    if (positions.size > 0) {
      await tx
        .insert(schema.bookSeries)
        .values([...positions].map(([seriesId, position]) => ({ bookId, seriesId, position })));
    }

    await tx.delete(schema.bookGenres).where(orm.eq(schema.bookGenres.bookId, bookId));
    await tx.delete(schema.bookSubjects).where(orm.eq(schema.bookSubjects.bookId, bookId));
    await insertGenresAndSubjects(tx, bookId, book);

    return { error: null };
  });
}

/**
 * Saves the add-edition form: another published form of a book, with its publisher and credits.
 * Refuses an ISBN another edition already has.
 */
export async function createEditionServer({ bookId, ...edition }: CreateEditionInput) {
  await requirePermissionServer('catalog:manage');

  const save = async () =>
    db.transaction(async (tx) => {
      const book = await lockBook(tx, bookId);

      if (!book) {
        return { error: 'not-found' as const };
      }

      const [created] = await tx
        .insert(schema.editions)
        .values({
          bookId,
          title: edition.title,
          subtitle: edition.subtitle,
          ...(await editionValues(tx, edition)),
        })
        .returning({ id: schema.editions.id });

      await refileBook(tx, book, [...book.editions, edition]);

      // Whoever the book or another of its editions credits is kept over a homonym.
      const credits = await resolveCredits(
        tx,
        edition.contributors,
        authorsByName([
          ...book.editions.flatMap(({ contributors }) => contributors),
          ...book.contributors,
        ]),
      );

      await insertEditionCredits(tx, created!.id, credits);

      return { error: null };
    });

  return saveUnlessIsbnTaken(edition.isbn, save);
}

/**
 * Saves the edit-edition form: one published form of a book, with its publisher and credits.
 * Refuses an ISBN another edition already has.
 */
export async function updateEditionServer({ editionId, ...edition }: UpdateEditionInput) {
  await requirePermissionServer('catalog:manage');

  const save = async () =>
    db.transaction(async (tx) => {
      const [owner] = await tx
        .select({ bookId: schema.editions.bookId })
        .from(schema.editions)
        .where(orm.eq(schema.editions.id, editionId));
      const book = owner ? await lockBook(tx, owner.bookId) : null;
      const before = book?.editions.find(({ id }) => id === editionId);

      if (!book || !before) {
        return { error: 'not-found' as const };
      }

      await tx
        .update(schema.editions)
        .set({
          title: edition.title,
          subtitle: edition.subtitle,
          ...(await editionValues(tx, edition)),
        })
        .where(orm.eq(schema.editions.id, editionId));

      await refileBook(
        tx,
        book,
        book.editions.map((other) => (other.id === editionId ? edition : other)),
      );

      const credits = await resolveCredits(
        tx,
        edition.contributors,
        new Map([...authorsByName(book.contributors), ...authorsByName(before.contributors)]),
      );

      await tx
        .delete(schema.editionContributors)
        .where(orm.eq(schema.editionContributors.editionId, editionId));
      await insertEditionCredits(tx, editionId, credits);

      return { error: null };
    });

  return saveUnlessIsbnTaken(edition.isbn, save, editionId);
}

/**
 * Deletes a book with its editions, credits and places in series (`on delete cascade`). The
 * authors, series, publishers and subjects stay. Nothing to do when it is already gone.
 */
export async function deleteBookServer({ bookId }: { bookId: string }) {
  await requirePermissionServer('catalog:manage');

  await db.delete(schema.books).where(orm.eq(schema.books.id, bookId));
}

/**
 * Deletes one edition of a book, with its credits; the book stays, even without any edition.
 * Nothing to do when it is already gone.
 */
export async function deleteEditionServer({ editionId }: { editionId: string }) {
  await requirePermissionServer('catalog:manage');

  await db.transaction(async (tx) => {
    const [owner] = await tx
      .select({ bookId: schema.editions.bookId })
      .from(schema.editions)
      .where(orm.eq(schema.editions.id, editionId));
    const book = owner ? await lockBook(tx, owner.bookId) : null;

    if (!book) {
      return;
    }

    await tx.delete(schema.editions).where(orm.eq(schema.editions.id, editionId));

    const editions = book.editions.filter(({ id }) => id !== editionId);

    // The language of the title may now be another edition's. When no edition left says it, the
    // book stays filed where it is: the title didn't change language.
    if (!editions.some(({ title, language }) => title === null && language !== null)) {
      return;
    }

    await refileBook(tx, book, editions);
  });
}
