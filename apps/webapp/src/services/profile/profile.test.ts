import { describe, expect, it } from 'vitest';

import { displayNameSchema, mergeFeatureFlags } from './profile';

const search = {
  id: '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e01',
  key: 'book-search',
  description: 'Search the catalogue.',
};
const covers = { id: '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e02', key: 'covers', description: null };

describe('mergeFeatureFlags', () => {
  it('lists flags granted to the reader and flags open to everyone, sorted by key', () => {
    expect(mergeFeatureFlags([covers], [search])).toEqual([
      { ...search, grantedTo: 'everyone' },
      { ...covers, grantedTo: 'user' },
    ]);
  });

  it('lists a flag both granted and open to everyone once, as granted to the reader', () => {
    expect(mergeFeatureFlags([search], [search])).toEqual([{ ...search, grantedTo: 'user' }]);
  });

  it('returns nothing when the reader has no flag', () => {
    expect(mergeFeatureFlags([], [])).toEqual([]);
  });
});

describe('displayNameSchema', () => {
  it('trims the display name', () => {
    expect(displayNameSchema.parse({ displayName: '  Ada Lovelace ' })).toEqual({
      displayName: 'Ada Lovelace',
    });
  });

  it('rejects a blank or too long display name', () => {
    expect(displayNameSchema.safeParse({ displayName: '   ' }).success).toBe(false);
    expect(displayNameSchema.safeParse({ displayName: 'a'.repeat(101) }).success).toBe(false);
  });
});
