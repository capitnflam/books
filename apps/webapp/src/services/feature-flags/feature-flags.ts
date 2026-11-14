import { z } from 'zod';

import { parseUserListSearch } from '#/services/user-management/user-management';

export const FLAG_KEY_MAX_LENGTH = 64;
export const FLAG_DESCRIPTION_MAX_LENGTH = 500;

/** Users granted or revoked in one call; a bigger selection goes in several. */
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

const pageSchema = z.number().int().min(1);

/** One page of the users who have a flag, latest grants first. */
export const flagHoldersSchema = z.object({ flagId: z.uuid(), page: pageSchema });

/** One page of the users a flag can still be granted to, found by name. */
export const flagCandidatesSchema = z.object({
  flagId: z.uuid(),
  q: z.string().trim().min(1).max(100).optional(),
  page: pageSchema,
});

/** Reads the flag page's search param from the URL: the name to find users by. */
export function parseFlagDetailsSearch(search: Record<string, unknown>): { find?: string } {
  return { find: parseUserListSearch({ q: search.find }).q };
}

/** `ids` in batches the bulk server functions accept. */
export function inBulkBatches(ids: readonly string[]): string[][] {
  const batches: string[][] = [];

  for (let start = 0; start < ids.length; start += BULK_MAX_USERS) {
    batches.push(ids.slice(start, start + BULK_MAX_USERS));
  }

  return batches;
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
