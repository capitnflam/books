import { m } from '#/paraglide/messages';

import type { Permission } from '@books/database';

// A Record over Permission, so adding a permission fails the type check until it has a label.
const permissionLabels: Record<Permission, () => string> = {
  'collection:manage': m.permission_collection_manage,
  'catalog:manage': m.permission_catalog_manage,
  'users:read': m.permission_users_read,
  'users:manage': m.permission_users_manage,
  'roles:manage': m.permission_roles_manage,
  'user-roles:manage': m.permission_user_roles_manage,
  'feature-flags:manage': m.permission_feature_flags_manage,
};

/** A permission in words. Rows may still hold one removed from the code: show its identifier. */
export const permissionLabel = (permission: string) =>
  Object.hasOwn(permissionLabels, permission)
    ? permissionLabels[permission as Permission]()
    : permission;
