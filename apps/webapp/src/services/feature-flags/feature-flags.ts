import { z } from 'zod';

import { parseUserListSearch } from '#/services/user-management/user-management';

export const FLAG_KEY_MAX_LENGTH = 64;
export const FLAG_DESCRIPTION_MAX_LENGTH = 500;

/** Users granted or revoked in one go: a page of the list, and then some. */
const BULK_MAX_USERS = 100;

/** Uppercase words joined by underscores, like `BOOK_SEARCH`: what code checks. */
const FLAG_KEY_PATTERN = /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/u;

const flagKeySchema = z.string().trim().min(1).max(FLAG_KEY_MAX_LENGTH).regex(FLAG_KEY_PATTERN);

/** An empty description is no description. */
const flagDescriptionSchema = z
  .string()
  .trim()
  .max(FLAG_DESCRIPTION_MAX_LENGTH)
  .transform((value) => value || null);

export const createFeatureFlagSchema = z.object({
  key: flagKeySchema,
  description: flagDescriptionSchema,
});

/** Why a new flag's key was refused, or null when it is a valid key. */
export function flagKeyError(key: string): 'required' | 'too-long' | 'format' | null {
  const value = key.trim();

  if (!value) {
    return 'required';
  }

  if (value.length > FLAG_KEY_MAX_LENGTH) {
    return 'too-long';
  }

  return FLAG_KEY_PATTERN.test(value) ? null : 'format';
}

export const flagIdSchema = z.object({ flagId: z.uuid() });

/** A flag's new description. Its key never changes: code checks it. */
export const updateFeatureFlagSchema = z.object({
  flagId: z.uuid(),
  description: flagDescriptionSchema,
});

/** Users to grant a flag to, or take it from. */
export const flagUsersSchema = z.object({
  flagId: z.uuid(),
  userIds: z.array(z.uuid()).min(1).max(BULK_MAX_USERS),
});

/**
 * The flag page's two lists: who has the flag (`page`), and the users it can be granted to,
 * found by name (`find`, `findPage`).
 */
export const flagDetailsSearchSchema = z.object({
  page: z.number().int().min(1).optional(),
  find: z.string().trim().min(1).max(100).optional(),
  findPage: z.number().int().min(1).optional(),
});

export type FlagDetailsSearch = z.infer<typeof flagDetailsSearchSchema>;

/** Reads the flag page's search params from the URL, dropping malformed values. */
export function parseFlagDetailsSearch(search: Record<string, unknown>): FlagDetailsSearch {
  const holders = parseUserListSearch({ page: search.page });
  const candidates = parseUserListSearch({ q: search.find, page: search.findPage });

  return { page: holders.page, find: candidates.q, findPage: candidates.page };
}

/**
 * Whether every item of `visible` is in `selected` (`true`), some are (`'some'`) or none
 * (`false`): the state of a "select all" checkbox over a list.
 */
export function selectionState(selected: ReadonlySet<string>, visible: readonly string[]) {
  const count = visible.filter((id) => selected.has(id)).length;

  if (count === 0) {
    return false;
  }

  return count === visible.length ? true : 'some';
}
