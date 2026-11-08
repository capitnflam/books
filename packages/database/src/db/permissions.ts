/**
 * Every permission the app checks. Roles bundle these; code checks them, never role names.
 * Removing one here does not remove existing `role_permissions` rows: delete them in a migration.
 */
export const PERMISSIONS = [
  /** Create, edit and delete roles and choose their permissions. */
  'roles:manage',
  /** Assign roles to users and remove them. */
  'user-roles:manage',
  /** Create, edit and delete feature flags and grant them to users. */
  'feature-flags:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
