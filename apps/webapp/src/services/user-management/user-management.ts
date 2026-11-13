import { z } from 'zod';

import { displayNameSchema } from '#/services/profile/profile';

/** Users shown on one page of the list. */
export const USERS_PAGE_SIZE = 25;

const SEARCH_MAX_LENGTH = 100;

/** The user list's search: a name to look for and a page, both optional. */
export const userListSearchSchema = z.object({
  q: z.string().trim().min(1).max(SEARCH_MAX_LENGTH).optional(),
  page: z.number().int().min(1).optional(),
});

export type UserListSearch = z.infer<typeof userListSearchSchema>;

/**
 * Reads the user list's search params from the URL. A malformed value is dropped rather
 * than failing the page, and defaults are left out so plain links to `/users` need none.
 */
export function parseUserListSearch(search: Record<string, unknown>): UserListSearch {
  const q = typeof search.q === 'string' ? search.q.trim().slice(0, SEARCH_MAX_LENGTH) : '';
  const { page } = search;

  return {
    q: q || undefined,
    page: typeof page === 'number' && Number.isInteger(page) && page > 1 ? page : undefined,
  };
}

export const userIdSchema = z.object({ userId: z.uuid() });

/** A user's new role. There is no removing one: every user keeps a role. */
export const userRoleSchema = z.object({ userId: z.uuid(), roleId: z.uuid() });

export const userDisplayNameSchema = displayNameSchema.extend({ userId: z.uuid() });

export const userBlockedSchema = z.object({ userId: z.uuid(), blocked: z.boolean() });

/** Escapes `%`, `_` and `\` so a search matches them literally in a SQL `LIKE` pattern. */
export const escapeLike = (value: string) => value.replaceAll(/[%_\\]/gu, (char) => `\\${char}`);

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

/** How many pages `total` users fill; at least one, so an empty list still has a page. */
export const pageCount = (total: number) => Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));
