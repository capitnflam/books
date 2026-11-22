import { z } from 'zod';

import { parseListSearch } from '#/utils/list-search';
import { BULK_MAX } from '#/utils/selection';

export const FLAG_KEY_MAX_LENGTH = 64;
export const FLAG_DESCRIPTION_MAX_LENGTH = 500;

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
  userIds: z.array(z.uuid()).min(1).max(BULK_MAX),
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
  return { find: parseListSearch({ q: search.find }).q };
}
