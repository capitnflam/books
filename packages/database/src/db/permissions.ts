/**
 * Every permission the app checks. Roles bundle these; code checks them, never role names.
 * Removing one here does not remove existing `role_permissions` rows: delete them in a migration.
 */
export const PERMISSIONS = [
  /** Keep a personal collection: add, edit and remove books on one's own shelves. */
  'collection:manage',
  /** Edit, merge and delete the shared catalogue entries (books, authors) every collection uses. */
  'catalog:manage',
  /** See the list of users and the roles they hold. */
  'users:read',
  /** Edit users' profiles and block or delete their accounts (in Clerk and locally). */
  'users:manage',
  /** Create, edit and delete roles and choose their permissions. */
  'roles:manage',
  /** Assign roles to users and remove them. */
  'user-roles:manage',
  /** Create, edit and delete feature flags and grant them to users. */
  'feature-flags:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
