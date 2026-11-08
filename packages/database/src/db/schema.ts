import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgSchema,
  primaryKey,
  serial,
  text,
  timestamp,
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
  id: serial().primaryKey(),
  authenticationId: text('authentication_id').notNull().unique(),
  displayName: text('display_name'),
  ...timestamps,
});

/** A named bundle of permissions, assigned to users through `user_roles`. */
export const roles = booksSchema.table('roles', {
  id: serial().primaryKey(),
  name: text().notNull().unique(),
  description: text(),
  ...timestamps,
});

export const rolePermissions = booksSchema.table(
  'role_permissions',
  {
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permission: text().$type<Permission>().notNull(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permission] })],
);

export const userRoles = booksSchema.table(
  'user_roles',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    /** The admin who assigned the role; null when seeded or when that user was deleted. */
    grantedBy: integer('granted_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

/**
 * A not-yet-released feature. A user has it when `enabled_for_all` is set or a
 * `user_feature_flags` row grants it to them.
 */
export const featureFlags = booksSchema.table('feature_flags', {
  id: serial().primaryKey(),
  /** The identifier code checks, e.g. `book-search`. */
  key: text().notNull().unique(),
  description: text(),
  enabledForAll: boolean('enabled_for_all').default(false).notNull(),
  ...timestamps,
});

export const userFeatureFlags = booksSchema.table(
  'user_feature_flags',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    featureFlagId: integer('feature_flag_id')
      .notNull()
      .references(() => featureFlags.id, { onDelete: 'cascade' }),
    /** The admin who granted the flag; null when seeded or when that user was deleted. */
    grantedBy: integer('granted_by').references(() => users.id, { onDelete: 'set null' }),
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
