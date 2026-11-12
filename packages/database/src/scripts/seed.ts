import { eq } from 'drizzle-orm';

import { db } from '../db/index.ts';
import { ADMIN_ROLE_NAME, BUILT_IN_ROLES } from '../db/roles.ts';
import { rolePermissions, roles, userRoles, users } from '../db/schema.ts';

/**
 * Creates the built-in roles, or adds the permissions they are missing. Descriptions and
 * permissions admins added are kept; the default role is set only when no role is the default.
 */
async function seedRoles() {
  return db.transaction(async (tx) => {
    const hasDefault = await tx.query.roles.findFirst({ where: eq(roles.isDefault, true) });
    const roleIds = new Map<string, string>();

    for (const role of BUILT_IN_ROLES) {
      const isDefault = !hasDefault && role.isDefault;
      const [row] = await tx
        .insert(roles)
        .values({ name: role.name, description: role.description, isDefault })
        .onConflictDoUpdate({
          target: roles.name,
          set: isDefault ? { isDefault } : { name: role.name },
        })
        .returning();

      await tx
        .insert(rolePermissions)
        .values(role.permissions.map((permission) => ({ roleId: row!.id, permission })))
        .onConflictDoNothing();

      roleIds.set(role.name, row!.id);
    }

    return roleIds;
  });
}

/** Gives the default role to every user who has no role, e.g. users created before it existed. */
async function backfillDefaultRole() {
  const defaultRole = await db.query.roles.findFirst({ where: eq(roles.isDefault, true) });

  if (!defaultRole) {
    return;
  }

  const usersWithoutRole = await db.query.users.findMany({ with: { role: true } });
  const values = usersWithoutRole
    .filter((user) => !user.role)
    .map((user) => ({ userId: user.id, roleId: defaultRole.id }));

  if (values.length > 0) {
    await db.insert(userRoles).values(values).onConflictDoNothing();
    console.log(
      `Assigned the ${defaultRole.name} role to ${values.length} user(s) without a role.`,
    );
  }
}

/**
 * Nobody can grant the first admin from the app, so the seed does it: set
 * ADMIN_AUTHENTICATION_ID to a Clerk user ID (`user_…`) to make that user an admin.
 */
async function seedAdminUser(roleId: string) {
  const authenticationId = process.env.ADMIN_AUTHENTICATION_ID;

  if (!authenticationId) {
    console.log('ADMIN_AUTHENTICATION_ID is not set; no admin user assigned.');
    return;
  }

  const [adminUser] = await db
    .insert(users)
    .values({ authenticationId })
    .onConflictDoUpdate({ target: users.authenticationId, set: { authenticationId } })
    .returning();

  // A user has one role: admin replaces whichever they had.
  await db
    .insert(userRoles)
    .values({ userId: adminUser!.id, roleId })
    .onConflictDoUpdate({ target: userRoles.userId, set: { roleId, grantedBy: null } });
  console.log(`Assigned the ${ADMIN_ROLE_NAME} role to ${authenticationId}.`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set: export it or add it to packages/database/.env.local.',
    );
  }

  console.log('Seeding database...');

  const roleIds = await seedRoles();
  await seedAdminUser(roleIds.get(ADMIN_ROLE_NAME)!);

  // Sample users with fake Clerk IDs: they can't sign in, but they give admin screens data.
  await db
    .insert(users)
    .values([
      { authenticationId: 'seed_user_1', displayName: 'Ada Lovelace' },
      { authenticationId: 'seed_user_2', displayName: 'Jorge Luis Borges' },
      { authenticationId: 'seed_user_3', displayName: 'Mary Shelley' },
    ])
    .onConflictDoNothing();

  await backfillDefaultRole();
}

await main();
