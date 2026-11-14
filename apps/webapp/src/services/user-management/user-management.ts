import { z } from 'zod';

import { displayNameSchema } from '#/services/profile/profile';

/** Users loaded at a time as a list scrolls. */
export const USERS_PAGE_SIZE = 25;

const SEARCH_MAX_LENGTH = 100;

/** One page of the user list: a name to look for (optional) and the page, from 1. */
export const userListSearchSchema = z.object({
  q: z.string().trim().min(1).max(SEARCH_MAX_LENGTH).optional(),
  page: z.number().int().min(1).optional(),
});

export type UserListSearch = z.infer<typeof userListSearchSchema>;

/**
 * Reads the user list's search param from the URL. A malformed value is dropped rather than
 * failing the page, and an empty one is left out so plain links to `/users` need none.
 */
export function parseUserListSearch(search: Record<string, unknown>): { q?: string } {
  const q = typeof search.q === 'string' ? search.q.trim().slice(0, SEARCH_MAX_LENGTH) : '';

  return { q: q || undefined };
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

/** The page to load after `loadedPages` pages of a `total`-user list, or none when all are in. */
export const nextPage = (loadedPages: number, total: number) =>
  loadedPages * USERS_PAGE_SIZE < total ? loadedPages + 1 : undefined;
