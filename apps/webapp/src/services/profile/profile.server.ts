import { db, orm, schema } from '@books/database';
import { auth, clerkClient } from '@clerk/tanstack-react-start/server';

import { getServerEnv } from '#/config/env';
import { getAuthenticatedUserServer } from '#/services/users/users.server';

import { sortPermissions } from './permissions';
import { mergeFeatureFlags } from './profile';

/**
 * Everything the profile page shows from the database: the reader, their role with its
 * permissions, and the feature flags open to them. Null when nobody is signed in.
 */
export async function getProfileServer() {
  const user = await getAuthenticatedUserServer();

  if (!user) {
    return null;
  }

  const clerk = clerkClient({ secretKey: getServerEnv().CLERK_SECRET_KEY });

  // The Clerk account is fetched here too, so the email and picture are in the server render
  // instead of appearing once Clerk loads in the browser.
  const [account, userRole, grantedFlags, flagsForAll] = await Promise.all([
    clerk.users.getUser(user.authenticationId),
    db.query.userRoles.findFirst({
      where: orm.eq(schema.userRoles.userId, user.id),
      with: { role: { with: { permissions: true } } },
    }),
    db.query.userFeatureFlags.findMany({
      where: orm.eq(schema.userFeatureFlags.userId, user.id),
      with: { featureFlag: true },
    }),
    db.query.featureFlags.findMany({
      where: orm.eq(schema.featureFlags.enabledForAll, true),
    }),
  ]);

  return {
    user,
    account: {
      fullName: account.fullName,
      email: account.primaryEmailAddress?.emailAddress ?? '',
      imageUrl: account.imageUrl,
    },
    role: userRole && {
      id: userRole.role.id,
      name: userRole.role.name,
      description: userRole.role.description,
      permissions: sortPermissions(userRole.role.permissions.map(({ permission }) => permission)),
      grantedAt: userRole.createdAt,
    },
    featureFlags: mergeFeatureFlags(
      grantedFlags.map(({ featureFlag }) => featureFlag),
      flagsForAll,
    ),
  };
}

/** Renames the signed-in reader. Returns the updated user, or null when nobody is signed in. */
export async function updateDisplayNameServer(displayName: string) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const [user] = await db
    .update(schema.users)
    .set({ displayName })
    .where(orm.eq(schema.users.authenticationId, userId))
    .returning();

  return user ?? null;
}
