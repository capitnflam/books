import { db, orm, schema } from '@books/database';

import { requirePermissionServer } from '#/services/access/access.server';
import { USERS_PAGE_SIZE, escapeLike } from '#/services/user-management/user-management';
import { loadAccountsServer } from '#/services/user-management/user-management.server';

/** Every flag, sorted by key, with how many users it is granted to. */
export async function listFeatureFlagsServer() {
  await requirePermissionServer('feature-flags:manage');

  return db
    .select({
      id: schema.featureFlags.id,
      key: schema.featureFlags.key,
      description: schema.featureFlags.description,
      createdAt: schema.featureFlags.createdAt,
      userCount: orm.count(schema.userFeatureFlags.userId),
    })
    .from(schema.featureFlags)
    .leftJoin(
      schema.userFeatureFlags,
      orm.eq(schema.userFeatureFlags.featureFlagId, schema.featureFlags.id),
    )
    .groupBy(schema.featureFlags.id)
    .orderBy(orm.asc(schema.featureFlags.key));
}

/** Creates a flag; refuses a key another flag already has. */
export async function createFeatureFlagServer(flag: { key: string; description: string | null }) {
  await requirePermissionServer('feature-flags:manage');

  const [created] = await db
    .insert(schema.featureFlags)
    .values(flag)
    .onConflictDoNothing({ target: schema.featureFlags.key })
    .returning({ id: schema.featureFlags.id });

  return created ? { id: created.id, error: null } : { id: null, error: 'key-taken' as const };
}

/** Users with their Clerk email and picture, for the flag page's lists. */
async function withAccountsServer<T extends { authenticationId: string }>(users: T[]) {
  const { accounts } = await loadAccountsServer(
    users.map(({ authenticationId }) => authenticationId),
  );

  return users.map(({ authenticationId, ...user }) => ({
    ...user,
    email: accounts.get(authenticationId)?.email ?? '',
    imageUrl: accounts.get(authenticationId)?.imageUrl ?? '',
  }));
}

/** The flag the flag page shows; null when it does not exist. */
export async function getFeatureFlagServer(flagId: string) {
  await requirePermissionServer('feature-flags:manage');

  const flag = await db.query.featureFlags.findFirst({
    where: orm.eq(schema.featureFlags.id, flagId),
  });

  return flag
    ? { id: flag.id, key: flag.key, description: flag.description, createdAt: flag.createdAt }
    : null;
}

/** One page of the users who have a flag, latest grants first, and how many have it. */
export async function listFlagHoldersServer({ flagId, page }: { flagId: string; page: number }) {
  await requirePermissionServer('feature-flags:manage');

  const granted = orm.eq(schema.userFeatureFlags.featureFlagId, flagId);
  const [grants, [counted]] = await Promise.all([
    db.query.userFeatureFlags.findMany({
      where: granted,
      with: { user: true, grantedByUser: true },
      orderBy: [
        orm.desc(schema.userFeatureFlags.createdAt),
        orm.asc(schema.userFeatureFlags.userId),
      ],
      limit: USERS_PAGE_SIZE,
      offset: (page - 1) * USERS_PAGE_SIZE,
    }),
    db.select({ total: orm.count() }).from(schema.userFeatureFlags).where(granted),
  ]);

  return {
    total: counted?.total ?? 0,
    users: await withAccountsServer(
      grants.map(({ user, createdAt, grantedByUser }) => ({
        id: user.id,
        authenticationId: user.authenticationId,
        displayName: user.displayName,
        grantedAt: createdAt,
        grantedBy: grantedByUser?.displayName ?? null,
      })),
    ),
  };
}

/**
 * One page of the users a flag can still be granted to, found by name and sorted by it, and
 * how many there are.
 */
export async function listFlagCandidatesServer({
  flagId,
  q,
  page,
}: {
  flagId: string;
  q?: string;
  page: number;
}) {
  await requirePermissionServer('feature-flags:manage');

  const candidates = orm.and(
    orm.notExists(
      db
        .select({ userId: schema.userFeatureFlags.userId })
        .from(schema.userFeatureFlags)
        .where(
          orm.and(
            orm.eq(schema.userFeatureFlags.featureFlagId, flagId),
            orm.eq(schema.userFeatureFlags.userId, schema.users.id),
          ),
        ),
    ),
    q ? orm.ilike(schema.users.displayName, `%${escapeLike(q)}%`) : undefined,
  );

  const [users, [counted]] = await Promise.all([
    // A plain select, not db.query: the relational API aliases the table, which the
    // `not exists` subquery's reference to `books.users.id` would no longer match.
    db
      .select({
        id: schema.users.id,
        authenticationId: schema.users.authenticationId,
        displayName: schema.users.displayName,
      })
      .from(schema.users)
      .where(candidates)
      .orderBy(
        orm.sql`lower(${schema.users.displayName}) asc nulls last`,
        orm.asc(schema.users.createdAt),
      )
      .limit(USERS_PAGE_SIZE)
      .offset((page - 1) * USERS_PAGE_SIZE),
    db.select({ total: orm.count() }).from(schema.users).where(candidates),
  ]);

  return { total: counted?.total ?? 0, users: await withAccountsServer(users) };
}

/** Changes a flag's description. */
export async function updateFeatureFlagServer({
  flagId,
  description,
}: {
  flagId: string;
  description: string | null;
}) {
  await requirePermissionServer('feature-flags:manage');

  const [flag] = await db
    .update(schema.featureFlags)
    .set({ description })
    .where(orm.eq(schema.featureFlags.id, flagId))
    .returning({ id: schema.featureFlags.id });

  if (!flag) {
    throw new Error('Feature flag not found.');
  }
}

/** Deletes a flag; its grants go with it (`on delete cascade`). */
export async function deleteFeatureFlagServer({ flagId }: { flagId: string }) {
  await requirePermissionServer('feature-flags:manage');

  await db.delete(schema.featureFlags).where(orm.eq(schema.featureFlags.id, flagId));
}

/** Grants a flag to users; those who already have it keep their original grant. */
export async function grantFeatureFlagServer({
  flagId,
  userIds,
}: {
  flagId: string;
  userIds: string[];
}) {
  const { user: actor } = await requirePermissionServer('feature-flags:manage');

  const granted = await db
    .insert(schema.userFeatureFlags)
    .values(
      [...new Set(userIds)].map((userId) => ({
        userId,
        featureFlagId: flagId,
        grantedBy: actor.id,
      })),
    )
    .onConflictDoNothing()
    .returning({ userId: schema.userFeatureFlags.userId });

  return { count: granted.length };
}

/** Takes a flag away from users. */
export async function revokeFeatureFlagServer({
  flagId,
  userIds,
}: {
  flagId: string;
  userIds: string[];
}) {
  await requirePermissionServer('feature-flags:manage');

  const revoked = await db
    .delete(schema.userFeatureFlags)
    .where(
      orm.and(
        orm.eq(schema.userFeatureFlags.featureFlagId, flagId),
        orm.inArray(schema.userFeatureFlags.userId, userIds),
      ),
    )
    .returning({ userId: schema.userFeatureFlags.userId });

  return { count: revoked.length };
}
