import { z } from 'zod';

import { displayNameSchema } from '#/services/profile/profile';

export const userIdSchema = z.object({ userId: z.uuid() });

/** A user's new role. There is no removing one: every user keeps a role. */
export const userRoleSchema = z.object({ userId: z.uuid(), roleId: z.uuid() });

export const userDisplayNameSchema = displayNameSchema.extend({ userId: z.uuid() });

export const userBlockedSchema = z.object({ userId: z.uuid(), blocked: z.boolean() });

/**
 * Whether a user can sign in: `blocked` or `active` from their Clerk account, `no-account`
 * when Clerk has none for them, and `unknown` when Clerk could not be reached.
 */
export const accountStatus = (
  loaded: boolean,
  account: { banned: boolean } | undefined,
): 'active' | 'blocked' | 'no-account' | 'unknown' => {
  if (!loaded) {
    return 'unknown';
  }

  if (!account) {
    return 'no-account';
  }

  return account.banned ? 'blocked' : 'active';
};
