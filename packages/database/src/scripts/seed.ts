import { db } from '../db/index.ts';
import { PERMISSIONS } from '../db/permissions.ts';
import { rolePermissions, roles, userRoles, users } from '../db/schema.ts';

const ADMIN_ROLE_NAME = 'admin';

/** Creates the `admin` role, or brings it up to date, with every permission. */
async function seedAdminRole() {
  const [adminRole] = await db
    .insert(roles)
    .values({ name: ADMIN_ROLE_NAME, description: 'Manages roles, user roles and feature flags.' })
    .onConflictDoUpdate({ target: roles.name, set: { name: ADMIN_ROLE_NAME } })
    .returning();

  await db
    .insert(rolePermissions)
    .values(PERMISSIONS.map((permission) => ({ roleId: adminRole!.id, permission })))
    .onConflictDoNothing();

  return adminRole!;
}

/**
 * Nobody can grant the first admin from the app, so the seed does it: set
 * ADMIN_AUTHENTICATION_ID to a Clerk user ID (`user_…`) to make that user an admin.
 */
async function seedAdminUser(roleId: number) {
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

  await db.insert(userRoles).values({ userId: adminUser!.id, roleId }).onConflictDoNothing();
  console.log(`Assigned the ${ADMIN_ROLE_NAME} role to ${authenticationId}.`);
}

async function main() {
  console.log('Seeding database...');

  const adminRole = await seedAdminRole();
  await seedAdminUser(adminRole.id);

  // Sample users with fake Clerk IDs: they can't sign in, but they give admin screens data.
  await db
    .insert(users)
    .values([
      { authenticationId: 'seed_user_1', displayName: 'Ada Lovelace' },
      { authenticationId: 'seed_user_2', displayName: 'Jorge Luis Borges' },
      { authenticationId: 'seed_user_3', displayName: 'Mary Shelley' },
    ])
    .onConflictDoNothing();
}

await main();
