import type { users } from '../db/schema.ts'

export type SelectUser = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert
