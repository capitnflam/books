import { db, orm, schema } from '@books/database';
import { clerkClient } from '@clerk/tanstack-react-start/server';

import { getServerEnv } from '#/config/env';
import { requirePermissionServer } from '#/services/access/access.server';
import { sortPermissions } from '#/services/profile/permissions';

import { USERS_PAGE_SIZE, accountStatus, escapeLike } from './user-management';

import type { UserListSearch } from './user-management';
import type { SelectUser } from '@books/database';

const getClerk = () => clerkClient({ secretKey: getServerEnv().CLERK_SECRET_KEY });

/** Fails when a user tries to act on their own account, so nobody locks themselves out. */
function assertNotSelf(actor: SelectUser, userId: string) {
  if (actor.id === userId) {
    throw new Error('You cannot change your own access or account.');
  }
}

async function findUserServer(userId: string) {
  const user = await db.query.users.findFirst({ where: orm.eq(schema.users.id, userId) });

  if (!user) {
    throw new Error('User not found.');
  }

  return user;
}

/** Whether a Clerk API error says the user does not exist (anymore). */
const isNotFound = (error: unknown) =>
  typeof error === 'object' && error !== null && 'status' in error && error.status === 404;

/**
 * The Clerk accounts of up to one page of users, by Clerk user ID: emails and pictures live
 * in Clerk. `loaded` is false when Clerk could not be reached, so the users show without them.
 */
export async function loadAccountsServer(authenticationIds: string[]) {
  const accounts = new Map<string, { email: string; imageUrl: string; banned: boolean }>();

  if (authenticationIds.length === 0) {
    return { loaded: true, accounts };
  }

  try {
    const { data } = await getClerk().users.getUserList({
      userId: authenticationIds,
      limit: authenticationIds.length,
    });

    for (const account of data) {
      accounts.set(account.id, {
        email: account.primaryEmailAddress?.emailAddress ?? '',
        imageUrl: account.imageUrl,
        banned: account.banned,
      });
    }

    return { loaded: true, accounts };
  } catch (error) {
    console.error('Could not load the Clerk accounts of a user list', error);

    return { loaded: false, accounts };
  }
}

/** One page of users, sorted by name, with their roles and their Clerk account. */
export async function listUsersServer({ q, page = 1 }: UserListSearch) {
  await requirePermissionServer('users:read');

  const where = q ? orm.ilike(schema.users.displayName, `%${escapeLike(q)}%`) : undefined;

  const [users, [counted]] = await Promise.all([
    db.query.users.findMany({
      where,
      with: { role: { with: { role: true } } },
      orderBy: [
        orm.sql`lower(${schema.users.displayName}) asc nulls last`,
        orm.asc(schema.users.createdAt),
      ],
      limit: USERS_PAGE_SIZE,
      offset: (page - 1) * USERS_PAGE_SIZE,
    }),
    db.select({ total: orm.count() }).from(schema.users).where(where),
  ]);

  const { loaded, accounts } = await loadAccountsServer(
    users.map(({ authenticationId }) => authenticationId),
  );

  return {
    total: counted?.total ?? 0,
    users: users.map((user) => {
      const account = accounts.get(user.authenticationId);

      return {
        id: user.id,
        displayName: user.displayName,
        email: account?.email ?? '',
        imageUrl: account?.imageUrl ?? '',
        status: accountStatus(loaded, account),
        createdAt: user.createdAt,
        role: user.role ? { id: user.role.role.id, name: user.role.role.name } : null,
      };
    }),
  };
}

/**
 * Everything the user page shows: the user, their Clerk account, their role, every role
 * that can be given, and what the viewer may do. Null when the user does not exist.
 */
export async function getUserDetailsServer(userId: string) {
  const viewer = await requirePermissionServer('users:read');

  const [user, allRoles] = await Promise.all([
    db.query.users.findFirst({
      where: orm.eq(schema.users.id, userId),
      with: {
        role: { with: { role: { with: { permissions: true } }, grantedByUser: true } },
      },
    }),
    db.query.roles.findMany({ orderBy: orm.asc(schema.roles.name) }),
  ]);

  if (!user) {
    return null;
  }

  let account = null;

  try {
    const clerkUser = await getClerk().users.getUser(user.authenticationId);

    account = {
      fullName: clerkUser.fullName,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
      imageUrl: clerkUser.imageUrl,
      blocked: clerkUser.banned,
      lastSignInAt: clerkUser.lastSignInAt === null ? null : new Date(clerkUser.lastSignInAt),
    };
  } catch (error) {
    // A user deleted in Clerk but not here still shows, so it can be deleted here too.
    if (!isNotFound(error)) {
      console.error('Could not load the Clerk account of a user', error);
    }
  }

  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      createdAt: user.createdAt,
    },
    account,
    role: user.role && {
      id: user.role.role.id,
      name: user.role.role.name,
      description: user.role.role.description,
      permissions: sortPermissions(user.role.role.permissions.map(({ permission }) => permission)),
      grantedAt: user.role.createdAt,
      grantedBy: user.role.grantedByUser?.displayName ?? null,
    },
    allRoles: allRoles.map(({ id, name, description }) => ({ id, name, description })),
    isSelf: viewer.user.id === user.id,
    can: {
      manageUser: viewer.permissions.includes('users:manage'),
      manageRoles: viewer.permissions.includes('user-roles:manage'),
    },
  };
}

/** Sets another user's role, replacing the one they had: a user has exactly one. */
export async function setRoleServer({ userId, roleId }: { userId: string; roleId: string }) {
  const { user: actor } = await requirePermissionServer('user-roles:manage');
  assertNotSelf(actor, userId);

  const grant = { roleId, grantedBy: actor.id, createdAt: new Date() };

  await db
    .insert(schema.userRoles)
    .values({ userId, ...grant })
    .onConflictDoUpdate({ target: schema.userRoles.userId, set: grant });
}

/** Renames a user. */
export async function updateUserDisplayNameServer({
  userId,
  displayName,
}: {
  userId: string;
  displayName: string;
}) {
  await requirePermissionServer('users:manage');

  const [user] = await db
    .update(schema.users)
    .set({ displayName })
    .where(orm.eq(schema.users.id, userId))
    .returning();

  if (!user) {
    throw new Error('User not found.');
  }
}

/** Blocks another user from signing in (which also ends their sessions), or lets them back. */
export async function setUserBlockedServer({
  userId,
  blocked,
}: {
  userId: string;
  blocked: boolean;
}) {
  const { user: actor } = await requirePermissionServer('users:manage');
  assertNotSelf(actor, userId);

  const { authenticationId } = await findUserServer(userId);
  const clerk = getClerk();

  await (blocked ? clerk.users.banUser(authenticationId) : clerk.users.unbanUser(authenticationId));
}

/** Deletes another user's Clerk account and their local data. */
export async function deleteUserServer({ userId }: { userId: string }) {
  const { user: actor } = await requirePermissionServer('users:manage');
  assertNotSelf(actor, userId);

  const { authenticationId } = await findUserServer(userId);

  try {
    await getClerk().users.deleteUser(authenticationId);
  } catch (error) {
    // Already gone from Clerk: still delete the local copy.
    if (!isNotFound(error)) {
      throw error;
    }
  }

  // The role and feature flags go with the user (`on delete cascade`).
  await db.delete(schema.users).where(orm.eq(schema.users.id, userId));
}
