import { db, orm, schema } from '@books/database';

import { requireViewerServer } from '#/services/access/access.server';
import { PAGE_SIZE, escapeLike } from '#/utils/list-search';

import { bookCover } from './catalog';
import { GENRES } from './genres';
import { parseIsbn } from './isbn';

import type { ListSearch } from '#/utils/list-search';

/** Books whose title, an edition's title, a credited name or a series holds `q`, or with that ISBN. */
function matching(q: string) {
  const pattern = `%${escapeLike(q)}%`;
  const isbns = parseIsbn(q);

  return orm.or(
    orm.ilike(schema.books.title, pattern),
    orm.exists(
      db
        .select({ id: schema.bookContributors.bookId })
        .from(schema.bookContributors)
        .innerJoin(schema.authors, orm.eq(schema.authors.id, schema.bookContributors.authorId))
        .where(
          orm.and(
            orm.eq(schema.bookContributors.bookId, schema.books.id),
            orm.ilike(schema.authors.name, pattern),
          ),
        ),
    ),
    orm.exists(
      db
        .select({ id: schema.bookSeries.bookId })
        .from(schema.bookSeries)
        .innerJoin(schema.series, orm.eq(schema.series.id, schema.bookSeries.seriesId))
        .where(
          orm.and(
            orm.eq(schema.bookSeries.bookId, schema.books.id),
            orm.ilike(schema.series.name, pattern),
          ),
        ),
    ),
    orm.exists(
      db
        .select({ id: schema.editions.id })
        .from(schema.editions)
        .where(
          orm.and(
            orm.eq(schema.editions.bookId, schema.books.id),
            orm.or(
              orm.ilike(schema.editions.title, pattern),
              isbns ? orm.eq(schema.editions.isbn13, isbns.isbn13) : undefined,
              isbns?.isbn10 ? orm.eq(schema.editions.isbn10, isbns.isbn10) : undefined,
            ),
          ),
        ),
    ),
  );
}

/** One page of the catalogue, in filing order, for any signed-in reader. */
export async function listBooksServer({ q, page = 1 }: ListSearch) {
  await requireViewerServer();

  const where = q ? matching(q) : undefined;

  const [ids, [counted]] = await Promise.all([
    db
      .select({ id: schema.books.id })
      .from(schema.books)
      .where(where)
      .orderBy(orm.sql`lower(${schema.books.sortTitle})`, orm.asc(schema.books.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: orm.count() }).from(schema.books).where(where),
  ]);
  const books =
    ids.length === 0
      ? []
      : await db.query.books.findMany({
          where: orm.inArray(
            schema.books.id,
            ids.map(({ id }) => id),
          ),
          with: {
            contributors: {
              where: orm.eq(schema.bookContributors.role, 'author'),
              orderBy: orm.asc(schema.bookContributors.position),
              with: { author: { columns: { name: true } } },
            },
            editions: {
              orderBy: orm.asc(schema.editions.createdAt),
              columns: { title: true, coverImageUrl: true },
            },
          },
        });
  const byId = new Map(books.map((book) => [book.id, book]));

  return {
    total: counted?.total ?? 0,
    books: ids.flatMap(({ id }) => {
      const book = byId.get(id);

      return book
        ? {
            id,
            title: book.title,
            subtitle: book.subtitle,
            firstPublishedYear: book.firstPublishedYear,
            authors: book.contributors.map(({ author }) => author.name),
            coverImageUrl: bookCover(book.editions),
          }
        : [];
    }),
  };
}

/**
 * Everything the book page and the edit forms show, for any signed-in reader, and whether the
 * viewer may edit it. Null when there is no such book.
 */
export async function getBookServer(bookId: string) {
  const viewer = await requireViewerServer();

  const book = await db.query.books.findFirst({
    where: orm.eq(schema.books.id, bookId),
    with: {
      contributors: {
        orderBy: orm.asc(schema.bookContributors.position),
        with: { author: { columns: { id: true, name: true } } },
      },
      series: { with: { series: { columns: { id: true, name: true, sortName: true } } } },
      subjects: { with: { subject: { columns: { id: true, name: true } } } },
      genres: true,
      editions: {
        orderBy: [
          orm.sql`${schema.editions.publishedYear} nulls last`,
          orm.asc(schema.editions.createdAt),
        ],
        with: {
          publisher: { columns: { id: true, name: true } },
          contributors: {
            orderBy: orm.asc(schema.editionContributors.position),
            with: { author: { columns: { id: true, name: true } } },
          },
        },
      },
    },
  });

  if (!book) {
    return null;
  }

  const genres = new Set(book.genres.map(({ genre }) => genre));

  return {
    book: {
      ...book,
      series: book.series.toSorted((a, b) => a.series.sortName.localeCompare(b.series.sortName)),
      subjects: book.subjects
        .map(({ subject }) => subject)
        .toSorted((a, b) => a.name.localeCompare(b.name)),
      // Rows may still hold a genre removed from the code: it has no name to show.
      genres: GENRES.filter((genre) => genres.has(genre)),
    },
    can: { edit: viewer.permissions.includes('catalog:manage') },
  };
}
