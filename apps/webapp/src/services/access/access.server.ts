import { PERMISSIONS, db, orm, schema } from '@books/database';
import { redirect } from '@tanstack/react-router';

import { checkIsAuthenticatedServer } from '#/services/authentication/authentication.server';
import { sortPermissions } from '#/services/profile/permissions';
import { getAuthenticatedUserServer } from '#/services/users/users.server';

import type { Permission } from '@books/database';

const isPermission = (value: string): value is Permission =>
  (PERMISSIONS as readonly string[]).includes(value);

/** Every permission a user holds through their roles, each once, in the order of `PERMISSIONS`. */
async function getPermissionsOfUserServer(userId: string): Promise<Permission[]> {
  const rows = await db
    .selectDistinct({ permission: schema.rolePermissions.permission })
    .from(schema.userRoles)
    .innerJoin(
      schema.rolePermissions,
      orm.eq(schema.rolePermissions.roleId, schema.userRoles.roleId),
    )
    .where(orm.eq(schema.userRoles.userId, userId));

  // Rows may still hold a permission removed from the code: it grants nothing.
  return sortPermissions(
    rows.map(({ permission }) => permission).filter((permission) => isPermission(permission)),
  );
}

/** The signed-in user and their permissions; null when nobody is signed in. */
async function getViewerServer() {
  const user = await getAuthenticatedUserServer();

  if (!user) {
    return null;
  }

  return { user, permissions: await getPermissionsOfUserServer(user.id) };
}

/** The signed-in user's permissions; none when nobody is signed in. */
export async function getMyPermissionsServer() {
  return (await getViewerServer())?.permissions ?? [];
}

/** Thrown by a server function called without the permission it needs. */
class ForbiddenError extends Error {
  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = 'ForbiddenError';
  }
}

/**
 * Guards a server function: returns the signed-in user and their permissions when they hold
 * `permission`, and throws otherwise. Every server function reading or changing other users'
 * data calls it, since route guards do not protect server functions.
 */
export async function requirePermissionServer(permission: Permission) {
  const viewer = await getViewerServer();

  if (!viewer?.permissions.includes(permission)) {
    throw new ForbiddenError(permission);
  }

  return viewer;
}

/**
 * Guards a page: sends a signed-out visitor to the sign-in page, and a signed-in user
 * without `permission` to the forbidden page.
 */
export async function checkPermissionServer(permission: Permission, redirect_url: string) {
  await checkIsAuthenticatedServer(redirect_url);

  if (!isPermission(permission) || !(await getMyPermissionsServer()).includes(permission)) {
    redirect({ to: '/forbidden', throw: true });
  }
}
