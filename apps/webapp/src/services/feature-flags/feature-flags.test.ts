import { describe, expect, it } from 'vitest';

import {
  createFeatureFlagSchema,
  flagKeyError,
  flagUsersSchema,
  inBulkBatches,
  parseFlagDetailsSearch,
  selectionState,
} from './feature-flags';

const flagId = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e10';
const userId = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e11';

describe('flagKeyError', () => {
  it('accepts uppercase words joined by single underscores', () => {
    expect(flagKeyError('BOOK_SEARCH')).toBeNull();
    expect(flagKeyError('  COVERS2  ')).toBeNull();
  });

  it('explains why a key is refused', () => {
    expect(flagKeyError('   ')).toBe('required');
    expect(flagKeyError('a'.repeat(65))).toBe('too-long');
    expect(flagKeyError('book_search')).toBe('format');
    expect(flagKeyError('Book_Search')).toBe('format');
    expect(flagKeyError('BOOK-SEARCH')).toBe('format');
    expect(flagKeyError('BOOK__SEARCH')).toBe('format');
    expect(flagKeyError('_BOOK')).toBe('format');
    expect(flagKeyError('BOOK_')).toBe('format');
    expect(flagKeyError('BOOK SEARCH')).toBe('format');
  });
});

describe('createFeatureFlagSchema', () => {
  it('trims the key and turns an empty description into none', () => {
    expect(
      createFeatureFlagSchema.parse({
        key: ' BOOK_SEARCH ',
        description: '  ',
      }),
    ).toEqual({ key: 'BOOK_SEARCH', description: null });
  });

  it('refuses a key the format check refuses', () => {
    expect(createFeatureFlagSchema.safeParse({ key: 'book', description: '' }).success).toBe(false);
  });
});

describe('flagUsersSchema', () => {
  it('needs at least one user and at most a hundred', () => {
    expect(flagUsersSchema.safeParse({ flagId, userIds: [userId] }).success).toBe(true);
    expect(flagUsersSchema.safeParse({ flagId, userIds: [] }).success).toBe(false);
    expect(
      flagUsersSchema.safeParse({ flagId, userIds: Array.from({ length: 101 }, () => userId) })
        .success,
    ).toBe(false);
  });
});

describe('parseFlagDetailsSearch', () => {
  it('keeps a trimmed name to find and drops an empty or malformed one', () => {
    expect(parseFlagDetailsSearch({ find: ' ada ' })).toEqual({ find: 'ada' });
    expect(parseFlagDetailsSearch({ find: '' })).toEqual({ find: undefined });
    expect(parseFlagDetailsSearch({ find: 3 })).toEqual({ find: undefined });
  });
});

describe('inBulkBatches', () => {
  it('splits a selection into batches of at most a hundred', () => {
    const ids = Array.from({ length: 230 }, (_, index) => String(index));

    expect(inBulkBatches(ids).map((batch) => batch.length)).toEqual([100, 100, 30]);
    expect(inBulkBatches(ids).flat()).toEqual(ids);
  });

  it('returns no batch for no ids', () => {
    expect(inBulkBatches([])).toEqual([]);
  });
});

describe('selectionState', () => {
  const visible = ['a', 'b'];

  it('says whether none, some or all of the visible items are selected', () => {
    expect(selectionState(new Set(), visible)).toBe(false);
    expect(selectionState(new Set(['a', 'z']), visible)).toBe('some');
    expect(selectionState(new Set(['a', 'b']), visible)).toBe(true);
  });

  it('is false for an empty list', () => {
    expect(selectionState(new Set(['a']), [])).toBe(false);
  });
});
