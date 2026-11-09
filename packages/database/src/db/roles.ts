import { PERMISSIONS } from './permissions.ts';

import type { Permission } from './permissions.ts';

type BuiltInRole = {
  name: string;
  description: string;
  permissions: readonly Permission[];
  /** New users get the default role at first sign-in; only one role can be the default. */
  isDefault: boolean;
};

/**
 * The roles the seed creates. Admins can edit them and create others from the app afterwards;
 * the seed adds missing permissions to them but never removes any.
 */
export const BUILT_IN_ROLES = [
  {
    name: 'reader',
    description: 'Keeps a personal collection of books.',
    permissions: ['collection:manage'],
    isDefault: true,
  },
  {
    name: 'moderator',
    description: 'Keeps a collection and looks after the shared catalogue.',
    permissions: ['collection:manage', 'catalog:manage', 'users:read'],
    isDefault: false,
  },
  {
    name: 'admin',
    description: 'Has every permission, including managing roles, user roles and feature flags.',
    permissions: PERMISSIONS,
    isDefault: false,
  },
] as const satisfies readonly BuiltInRole[];

export const ADMIN_ROLE_NAME = 'admin';
