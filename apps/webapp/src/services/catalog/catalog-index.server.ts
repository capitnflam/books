import { db, orm, schema } from '@books/database';

import { requirePermissionServer } from '#/services/access/access.server';
import { PAGE_SIZE, escapeLike } from '#/utils/list-search';

import type { IndexEntriesInput, IndexKind, ListIndexInput } from './catalog-index';

const TABLES = {
  authors: schema.authors,
  series: schema.series,
  publishers: schema.publishers,
  subjects: schema.subjects,
} satisfies Record<IndexKind, unknown>;

const FILED_AS = {
  authors: schema.authors.sortName,
  series: schema.series.sortName,
  publishers: schema.publishers.name,
  subjects: schema.subjects.name,
} satisfies Record<IndexKind, unknown>;

/** Each entry of a kind with the books using it, themselves or through one of their editions. */
function usesOf(kind: IndexKind) {
  switch (kind) {
    case 'authors':
      return db
        .select({
          entryId: schema.bookContributors.authorId,
          bookId: schema.bookContributors.bookId,
        })
        .from(schema.bookContributors)
        .unionAll(
          db
            .select({
              entryId: schema.editionContributors.authorId,
              bookId: schema.editions.bookId,
            })
            .from(schema.editionContributors)
            .innerJoin(
              schema.editions,
              orm.eq(schema.editions.id, schema.editionContributors.editionId),
            ),
        )
        .as('uses');
    case 'series':
      return db
        .select({ entryId: schema.bookSeries.seriesId, bookId: schema.bookSeries.bookId })
        .from(schema.bookSeries)
        .as('uses');
    case 'publishers':
      return db
        .select({ entryId: schema.editions.publisherId, bookId: schema.editions.bookId })
        .from(schema.editions)
        .as('uses');
    case 'subjects':
      return db
        .select({ entryId: schema.bookSubjects.subjectId, bookId: schema.bookSubjects.bookId })
        .from(schema.bookSubjects)
        .as('uses');
  }
}

/** The entries of a kind that no book uses. */
function isUnused(kind: IndexKind) {
  const uses = usesOf(kind);

  return orm.notExists(
    db.select({ bookId: uses.bookId }).from(uses).where(orm.eq(uses.entryId, TABLES[kind].id)),
  );
}

/** One page of the catalogue index, in filing order, with how many books use each entry. */
export async function listIndexServer({ kind, q, unused, page = 1 }: ListIndexInput) {
  await requirePermissionServer('catalog:manage');

  const table = TABLES[kind];
  const where = orm.and(
    q ? orm.ilike(table.name, `%${escapeLike(q)}%`) : undefined,
    unused ? isUnused(kind) : undefined,
  );

  const [entries, [counted]] = await Promise.all([
    db
      .select({ id: table.id, name: table.name })
      .from(table)
      .where(where)
      .orderBy(orm.sql`lower(${FILED_AS[kind]})`, orm.asc(table.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: orm.count() }).from(table).where(where),
  ]);

  const uses = usesOf(kind);
  const counts =
    entries.length === 0
      ? []
      : await db
          .select({ id: uses.entryId, bookCount: orm.countDistinct(uses.bookId) })
          .from(uses)
          .where(
            orm.inArray(
              uses.entryId,
              entries.map(({ id }) => id),
            ),
          )
          .groupBy(uses.entryId);
  const bookCounts = new Map(counts.map(({ id, bookCount }) => [id, bookCount]));

  return {
    total: counted?.total ?? 0,
    entries: entries.map(({ id, name }) => ({ id, name, bookCount: bookCounts.get(id) ?? 0 })),
  };
}

/**
 * Deletes entries of the catalogue index: the books using a series, publisher or subject stay,
 * without it. An author still credited on a book is kept, so no book loses its author; `kept`
 * says how many were.
 */
export async function deleteIndexEntriesServer({ kind, ids }: IndexEntriesInput) {
  await requirePermissionServer('catalog:manage');

  const table = TABLES[kind];
  const chosen = orm.inArray(table.id, ids);

  await db.delete(table).where(kind === 'authors' ? orm.and(chosen, isUnused(kind)) : chosen);

  if (kind !== 'authors') {
    return { kept: 0 };
  }

  const [left] = await db.select({ kept: orm.count() }).from(table).where(chosen);

  return { kept: left?.kept ?? 0 };
}
