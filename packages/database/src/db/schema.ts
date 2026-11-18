import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgSchema,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import type { Permission } from './permissions.ts';

export const booksSchema = pgSchema('books');

const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

/** Local copy of a Clerk user; `authentication_id` is the Clerk user ID. */
export const users = booksSchema.table('users', {
  id: uuid().primaryKey().defaultRandom(),
  authenticationId: text('authentication_id').notNull().unique(),
  displayName: text('display_name'),
  ...timestamps,
});

/** A named bundle of permissions, assigned to users through `user_roles` (one role per user). */
export const roles = booksSchema.table(
  'roles',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull().unique(),
    description: text(),
    /** New users get this role when they first sign in. At most one role is the default. */
    isDefault: boolean('is_default').default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('roles_single_default')
      .on(table.isDefault)
      .where(sql`${table.isDefault}`),
  ],
);

export const rolePermissions = booksSchema.table(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permission: text().$type<Permission>().notNull(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permission] })],
);

/**
 * The role of each user: exactly one, so their permissions never overlap. A user gets the
 * default role at first sign-in, and can then only be switched to another role.
 */
export const userRoles = booksSchema.table('user_roles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  // A role someone holds can't be deleted: move its users to another role first.
  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'restrict' }),
  /** The admin who assigned the role; null when seeded or when that user was deleted. */
  grantedBy: uuid('granted_by').references(() => users.id, { onDelete: 'set null' }),
  /** When the user got this role. */
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/** A not-yet-released feature. A user has it when a `user_feature_flags` row grants it to them. */
export const featureFlags = booksSchema.table('feature_flags', {
  id: uuid().primaryKey().defaultRandom(),
  /** The identifier code checks, e.g. `BOOK_SEARCH`. */
  key: text().notNull().unique(),
  description: text(),
  ...timestamps,
});

export const userFeatureFlags = booksSchema.table(
  'user_feature_flags',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    featureFlagId: uuid('feature_flag_id')
      .notNull()
      .references(() => featureFlags.id, { onDelete: 'cascade' }),
    /** The admin who granted the flag; null when seeded or when that user was deleted. */
    grantedBy: uuid('granted_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.featureFlagId] })],
);

// ---------------------------------------------------------------------------------------------
// Catalogue: the shared record of books that every collection uses (`catalog:manage` edits it).
//
// A `book` is the work as written (The Hobbit); an `edition` is one published form of it (the
// 1937 Allen & Unwin hardcover, a French paperback, an audiobook): editions carry the ISBN, the
// format and the cover, and are what a reader owns. Titles and names are searched through
// trigram indexes (`pg_trgm`), which tolerate typos and behave the same in every language.
// ---------------------------------------------------------------------------------------------

/** What someone did on a book or an edition. */
export const contributorRole = booksSchema.enum('contributor_role', [
  'author',
  'editor',
  'illustrator',
  'translator',
  'narrator',
  'introduction',
]);

export const editionFormat = booksSchema.enum('edition_format', [
  'hardcover',
  'paperback',
  'mass_market_paperback',
  'ebook',
  'audiobook',
  'other',
]);

/** A person (or pen name) credited on books: authors, but also translators, illustrators… */
export const authors = booksSchema.table(
  'authors',
  {
    id: uuid().primaryKey().defaultRandom(),
    /** The name as displayed, e.g. `Jorge Luis Borges`. Not unique: homonyms exist. */
    name: text().notNull(),
    /** The name as filed in an index, e.g. `Borges, Jorge Luis`. */
    sortName: text('sort_name').notNull(),
    biography: text(),
    birthYear: smallint('birth_year'),
    deathYear: smallint('death_year'),
    imageUrl: text('image_url'),
    ...timestamps,
  },
  (table) => [
    index('authors_name_trgm').using('gin', table.name.op('gin_trgm_ops')),
    index('authors_sort_name').on(table.sortName),
    check(
      'authors_lifespan',
      sql`${table.deathYear} is null or ${table.birthYear} is null or ${table.deathYear} >= ${table.birthYear}`,
    ),
  ],
);

/** A named sequence of books, e.g. Discworld. A book can be in several (Discworld, City Watch). */
export const series = booksSchema.table(
  'series',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    /** The name as filed in an index, without a leading article: `Lord of the Rings, The`. */
    sortName: text('sort_name').notNull(),
    description: text(),
    ...timestamps,
  },
  (table) => [
    index('series_name_trgm').using('gin', table.name.op('gin_trgm_ops')),
    index('series_sort_name').on(table.sortName),
  ],
);

export const publishers = booksSchema.table('publishers', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  ...timestamps,
});

/** A genre or topic to browse and filter the catalogue by, e.g. `Fantasy`, `Short stories`. */
export const subjects = booksSchema.table('subjects', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  ...timestamps,
});

/** A work, independent of how it was published; its editions carry ISBNs, formats and covers. */
export const books = booksSchema.table(
  'books',
  {
    id: uuid().primaryKey().defaultRandom(),
    /** The title in the original language, e.g. `Ficciones`. */
    title: text().notNull(),
    subtitle: text(),
    /** The title as filed in an index, without a leading article: `Hobbit, The`. */
    sortTitle: text('sort_title').notNull(),
    description: text(),
    /** BCP 47 tag of the original language, e.g. `en`, `es`, `fr-CA`. */
    originalLanguage: text('original_language'),
    /** Year of first publication; negative for BCE. */
    firstPublishedYear: smallint('first_published_year'),
    ...timestamps,
  },
  (table) => [
    index('books_title_trgm').using('gin', table.title.op('gin_trgm_ops')),
    index('books_sort_title').on(table.sortTitle),
    index('books_first_published_year').on(table.firstPublishedYear),
  ],
);

/** Who wrote (or edited, illustrated…) a book, in credit order. */
export const bookContributors = booksSchema.table(
  'book_contributors',
  {
    bookId: uuid('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    // An author credited on a book can't be deleted: merge them into another author first.
    authorId: uuid('author_id')
      .notNull()
      .references(() => authors.id, { onDelete: 'restrict' }),
    role: contributorRole().default('author').notNull(),
    /** Display order among the book's credits, from 0. */
    position: smallint().default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.bookId, table.authorId, table.role] }),
    index('book_contributors_author_id').on(table.authorId),
  ],
);

/** A book's place in a series: `position` is null when unnumbered, and may be 0 or 1.5. */
export const bookSeries = booksSchema.table(
  'book_series',
  {
    bookId: uuid('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    seriesId: uuid('series_id')
      .notNull()
      .references(() => series.id, { onDelete: 'cascade' }),
    position: numeric({ precision: 6, scale: 2, mode: 'number' }),
  },
  (table) => [
    primaryKey({ columns: [table.bookId, table.seriesId] }),
    index('book_series_series_id_position').on(table.seriesId, table.position),
    check('book_series_position', sql`${table.position} >= 0`),
  ],
);

export const bookSubjects = booksSchema.table(
  'book_subjects',
  {
    bookId: uuid('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    subjectId: uuid('subject_id')
      .notNull()
      .references(() => subjects.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.bookId, table.subjectId] }),
    index('book_subjects_subject_id').on(table.subjectId),
  ],
);

/** One published form of a book: it has the ISBN, the format and the cover; readers own these. */
export const editions = booksSchema.table(
  'editions',
  {
    id: uuid().primaryKey().defaultRandom(),
    bookId: uuid('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    /** The title printed on this edition when it differs from the book's, e.g. a translation. */
    title: text(),
    subtitle: text(),
    /** E.g. `2nd edition`, `50th anniversary edition`. */
    editionStatement: text('edition_statement'),
    publisherId: uuid('publisher_id').references(() => publishers.id, { onDelete: 'set null' }),
    publishedYear: smallint('published_year'),
    /** The exact day, when known; its year must be `published_year`. */
    publishedOn: date('published_on'),
    /** Digits only, without hyphens. */
    isbn13: text().unique(),
    /** Digits only (the check digit may be `X`); books from before 2007 often have only this. */
    isbn10: text().unique(),
    /** BCP 47 tag of this edition's language. */
    language: text(),
    format: editionFormat(),
    pageCount: integer('page_count'),
    /** Running time of an audiobook, in minutes. */
    durationMinutes: integer('duration_minutes'),
    coverImageUrl: text('cover_image_url'),
    ...timestamps,
  },
  (table) => [
    index('editions_book_id').on(table.bookId),
    index('editions_publisher_id').on(table.publisherId),
    index('editions_title_trgm').using('gin', table.title.op('gin_trgm_ops')),
    check('editions_isbn13_format', sql`${table.isbn13} ~ '^97[89][0-9]{10}$'`),
    check('editions_isbn10_format', sql`${table.isbn10} ~ '^[0-9]{9}[0-9X]$'`),
    check('editions_page_count', sql`${table.pageCount} > 0`),
    check('editions_duration_minutes', sql`${table.durationMinutes} > 0`),
    check(
      'editions_published_on_year',
      sql`${table.publishedOn} is null or (${table.publishedYear} is not null and extract(year from ${table.publishedOn}) = ${table.publishedYear})`,
    ),
  ],
);

/** Credits that belong to one edition: its translator, an audiobook's narrator… */
export const editionContributors = booksSchema.table(
  'edition_contributors',
  {
    editionId: uuid('edition_id')
      .notNull()
      .references(() => editions.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id')
      .notNull()
      .references(() => authors.id, { onDelete: 'restrict' }),
    role: contributorRole().notNull(),
    /** Display order among the edition's credits, from 0. */
    position: smallint().default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.editionId, table.authorId, table.role] }),
    index('edition_contributors_author_id').on(table.authorId),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(userRoles, {
    fields: [users.id],
    references: [userRoles.userId],
    relationName: 'userRoles',
  }),
  featureFlags: many(userFeatureFlags, { relationName: 'userFeatureFlags' }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
  users: many(userRoles),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
    relationName: 'userRoles',
  }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
  grantedByUser: one(users, { fields: [userRoles.grantedBy], references: [users.id] }),
}));

export const featureFlagsRelations = relations(featureFlags, ({ many }) => ({
  users: many(userFeatureFlags),
}));

export const userFeatureFlagsRelations = relations(userFeatureFlags, ({ one }) => ({
  user: one(users, {
    fields: [userFeatureFlags.userId],
    references: [users.id],
    relationName: 'userFeatureFlags',
  }),
  featureFlag: one(featureFlags, {
    fields: [userFeatureFlags.featureFlagId],
    references: [featureFlags.id],
  }),
  grantedByUser: one(users, { fields: [userFeatureFlags.grantedBy], references: [users.id] }),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(bookContributors),
  editions: many(editionContributors),
}));

export const seriesRelations = relations(series, ({ many }) => ({
  books: many(bookSeries),
}));

export const publishersRelations = relations(publishers, ({ many }) => ({
  editions: many(editions),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  books: many(bookSubjects),
}));

export const booksRelations = relations(books, ({ many }) => ({
  contributors: many(bookContributors),
  series: many(bookSeries),
  subjects: many(bookSubjects),
  editions: many(editions),
}));

export const bookContributorsRelations = relations(bookContributors, ({ one }) => ({
  book: one(books, { fields: [bookContributors.bookId], references: [books.id] }),
  author: one(authors, { fields: [bookContributors.authorId], references: [authors.id] }),
}));

export const bookSeriesRelations = relations(bookSeries, ({ one }) => ({
  book: one(books, { fields: [bookSeries.bookId], references: [books.id] }),
  series: one(series, { fields: [bookSeries.seriesId], references: [series.id] }),
}));

export const bookSubjectsRelations = relations(bookSubjects, ({ one }) => ({
  book: one(books, { fields: [bookSubjects.bookId], references: [books.id] }),
  subject: one(subjects, { fields: [bookSubjects.subjectId], references: [subjects.id] }),
}));

export const editionsRelations = relations(editions, ({ one, many }) => ({
  book: one(books, { fields: [editions.bookId], references: [books.id] }),
  publisher: one(publishers, { fields: [editions.publisherId], references: [publishers.id] }),
  contributors: many(editionContributors),
}));

export const editionContributorsRelations = relations(editionContributors, ({ one }) => ({
  edition: one(editions, { fields: [editionContributors.editionId], references: [editions.id] }),
  author: one(authors, { fields: [editionContributors.authorId], references: [authors.id] }),
}));
