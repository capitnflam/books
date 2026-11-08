import type { featureFlags, roles } from '../db/schema.ts';

export type SelectRole = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

export type SelectFeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;
