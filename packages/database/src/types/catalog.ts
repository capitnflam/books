import type {
  authors,
  books,
  contributorRole,
  editionFormat,
  editions,
  publishers,
  series,
  subjects,
} from '../db/schema.ts';

export type ContributorRole = (typeof contributorRole.enumValues)[number];
export type EditionFormat = (typeof editionFormat.enumValues)[number];

export type SelectBook = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

export type SelectEdition = typeof editions.$inferSelect;
export type InsertEdition = typeof editions.$inferInsert;

export type SelectAuthor = typeof authors.$inferSelect;
export type InsertAuthor = typeof authors.$inferInsert;

export type SelectSeries = typeof series.$inferSelect;
export type InsertSeries = typeof series.$inferInsert;

export type SelectPublisher = typeof publishers.$inferSelect;
export type InsertPublisher = typeof publishers.$inferInsert;

export type SelectSubject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;
