import { db, orm, schema } from '@books/database';
import { auth, clerkClient } from '@clerk/tanstack-react-start/server';

import { getServerEnv } from '#/config/env';

async function getUserByIdServer(authenticationId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: orm.eq(schema.users.authenticationId, authenticationId),
    });

    return user;
  } catch {
    return null;
  }
}

/** Creates the local user and gives them the default role, if one is set. */
async function insertUserServer(user: { authenticationId: string; displayName: string }) {
  try {
    return await db.transaction(async (tx) => {
      const [insertedUser] = await tx.insert(schema.users).values(user).returning();
      const defaultRole = await tx.query.roles.findFirst({
        where: orm.eq(schema.roles.isDefault, true),
      });

      if (insertedUser && defaultRole) {
        await tx
          .insert(schema.userRoles)
          .values({ userId: insertedUser.id, roleId: defaultRole.id });
      }

      return insertedUser;
    });
  } catch {
    return null;
  }
}

export async function getAuthenticatedUserServer() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  let user = await getUserByIdServer(userId);

  if (!user) {
    const clerk = clerkClient({
      secretKey: getServerEnv().CLERK_SECRET_KEY,
    });

    const authenticatedUser = await clerk.users.getUser(userId);
    user = await insertUserServer({
      authenticationId: userId,
      displayName: authenticatedUser.fullName || '',
    });
  }

  return user;
}
