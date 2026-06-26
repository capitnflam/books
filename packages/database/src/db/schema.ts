import { pgSchema, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const booksSchema = pgSchema('books')

export const users = booksSchema.table('users', {
  id: serial().primaryKey(),
  email: text().notNull(),
  name: text(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
