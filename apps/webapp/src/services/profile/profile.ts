import { z } from 'zod';

import type { SelectFeatureFlag } from '@books/database';

export const DISPLAY_NAME_MAX_LENGTH = 100;

export const displayNameSchema = z.object({
  displayName: z.string().trim().min(1).max(DISPLAY_NAME_MAX_LENGTH),
});

export type ProfileFeatureFlag = Pick<SelectFeatureFlag, 'id' | 'key' | 'description'> & {
  /** `user` when granted to this reader, `everyone` when only open to all. */
  grantedTo: 'user' | 'everyone';
};

/**
 * The feature flags a reader has, each once, sorted by key: those granted to them and
 * those enabled for everyone. A flag that is both counts as granted to them.
 */
export function mergeFeatureFlags(
  granted: Pick<SelectFeatureFlag, 'id' | 'key' | 'description'>[],
  forEveryone: Pick<SelectFeatureFlag, 'id' | 'key' | 'description'>[],
): ProfileFeatureFlag[] {
  const flags = new Map<string, ProfileFeatureFlag>();

  for (const { id, key, description } of forEveryone) {
    flags.set(id, { id, key, description, grantedTo: 'everyone' });
  }

  for (const { id, key, description } of granted) {
    flags.set(id, { id, key, description, grantedTo: 'user' });
  }

  return [...flags.values()].toSorted((a, b) => a.key.localeCompare(b.key));
}
