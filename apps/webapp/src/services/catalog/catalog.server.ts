import { db, orm, schema } from '@books/database';

import { requirePermissionServer } from '#/services/access/access.server';

import { isEditionRole, sortName, sortTitle } from './catalog';
import { parseIsbn } from './isbn';
import { lookupIsbnOnline } from './isbn-lookup.server';

import type { CreateBookInput } from './catalog';
import type { Isbns } from './isbn';
import type { BookDraft } from './isbn-lookup.server';

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** The catalogued edition that has one of these ISBNs, with its book's title. */
async function findEditionByIsbnServer({ isbn13, isbn10 }: Isbns) {
  const [edition] = await db
    .select({ bookId: schema.editions.bookId, title: schema.books.title })
    .from(schema.editions)
    .innerJoin(schema.books, orm.eq(schema.books.id, schema.editions.bookId))
    .where(
      orm.or(
        orm.eq(schema.editions.isbn13, isbn13),
        isbn10 ? orm.eq(schema.editions.isbn10, isbn10) : undefined,
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

/** Publishers and subjects have unique names: the existing row's id, or a new one's. */
async function findOrCreateNamed(
  tx: Transaction,
  table: typeof schema.publishers | typeof schema.subjects,
  names: string[],
) {
  if (names.length === 0) {
    return [];
  }

  await tx
    .insert(table)
    .values(names.map((name) => ({ name })))
    .onConflictDoNothing({ target: table.name });

  const rows = await tx.select({ id: table.id }).from(table).where(orm.inArray(table.name, names));

  return rows.map(({ id }) => id);
}

const isUniqueViolation = (error: unknown) =>
  error instanceof Error
  && ((error as { code?: unknown }).code === '23505'
    || (error.cause as { code?: unknown } | undefined)?.code === '23505');

/**
 * Adds a book and its edition to the catalogue, with their credits, publisher, series, genres
 * and subjects; reuses the authors, publisher, series and subjects that already exist by name.
 * Refuses an ISBN another edition already has.
 */
export async function createBookServer(book: CreateBookInput) {
  await requirePermissionServer('catalog:manage');

  if (book.isbn) {
    const existing = await findEditionByIsbnServer(book.isbn);

    if (existing) {
      return { error: 'isbn-taken' as const, ...existing };
    }
  }

  const language = book.originalLanguage ?? book.language;

  try {
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

      const [publisherId] = await findOrCreateNamed(
        tx,
        schema.publishers,
        book.publisher ? [book.publisher] : [],
      );
      const [edition] = await tx
        .insert(schema.editions)
        .values({
          bookId: id,
          editionStatement: book.editionStatement,
          publisherId: publisherId ?? null,
          publishedYear: book.published.publishedYear,
          publishedOn: book.published.publishedOn,
          isbn13: book.isbn?.isbn13 ?? null,
          isbn10: book.isbn?.isbn10 ?? null,
          language: book.language,
          format: book.format,
          pageCount: book.pageCount,
          durationMinutes: book.durationMinutes,
          coverImageUrl: book.coverImageUrl,
        })
        .returning({ id: schema.editions.id });

      // Credits keep the order they were entered in, counted apart for the book and the edition.
      const bookCredits: (typeof schema.bookContributors.$inferInsert)[] = [];
      const editionCredits: (typeof schema.editionContributors.$inferInsert)[] = [];
      const credited = new Set<string>();
      // Someone credited twice (author and illustrator) is looked up once.
      const authorIds = new Map<string, string>();

      for (const { name, role } of book.contributors) {
        const authorId = authorIds.get(name.toLowerCase()) ?? (await findOrCreateAuthor(tx, name));

        authorIds.set(name.toLowerCase(), authorId);
        const key = `${authorId}:${role}`;

        // The same person twice in the same role is one credit.
        if (credited.has(key)) {
          continue;
        }

        credited.add(key);

        if (isEditionRole(role)) {
          editionCredits.push({
            editionId: edition!.id,
            authorId,
            role,
            position: editionCredits.length,
          });
        } else {
          bookCredits.push({ bookId: id, authorId, role, position: bookCredits.length });
        }
      }

      if (bookCredits.length > 0) {
        await tx.insert(schema.bookContributors).values(bookCredits);
      }

      if (editionCredits.length > 0) {
        await tx.insert(schema.editionContributors).values(editionCredits);
      }

      if (book.series) {
        await tx.insert(schema.bookSeries).values({
          bookId: id,
          seriesId: await findOrCreateSeries(tx, book.series, language),
          position: book.seriesPosition,
        });
      }

      // `createBookSchema` requires at least one genre.
      await tx
        .insert(schema.bookGenres)
        .values(book.genres.map((genre) => ({ bookId: id, genre })));

      const subjectIds = await findOrCreateNamed(tx, schema.subjects, book.subjects);

      if (subjectIds.length > 0) {
        await tx
          .insert(schema.bookSubjects)
          .values(subjectIds.map((subjectId) => ({ bookId: id, subjectId })));
      }

      return id;
    });

    return { error: null, bookId, title: book.title };
  } catch (error) {
    // Another edition took the ISBN between the check and the insert.
    if (isUniqueViolation(error) && book.isbn) {
      const existing = await findEditionByIsbnServer(book.isbn);

      if (existing) {
        return { error: 'isbn-taken' as const, ...existing };
      }
    }

    throw error;
  }
}
