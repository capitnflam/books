import { pgSchema, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const booksSchema = pgSchema('books');

export const users = booksSchema.table('users', {
  id: serial().primaryKey(),
  authenticationId: text('authentication_id').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
