import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  pgSchema,
  primaryKey,
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

/** A named bundle of permissions, assigned to users through `user_roles`. */
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

export const userRoles = booksSchema.table(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    /** The admin who assigned the role; null when seeded or when that user was deleted. */
    grantedBy: uuid('granted_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

/**
 * A not-yet-released feature. A user has it when `enabled_for_all` is set or a
 * `user_feature_flags` row grants it to them.
 */
export const featureFlags = booksSchema.table('feature_flags', {
  id: uuid().primaryKey().defaultRandom(),
  /** The identifier code checks, e.g. `book-search`. */
  key: text().notNull().unique(),
  description: text(),
  enabledForAll: boolean('enabled_for_all').default(false).notNull(),
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

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles, { relationName: 'userRoles' }),
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
