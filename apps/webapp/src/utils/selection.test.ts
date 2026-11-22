import { describe, expect, it } from 'vitest';

import { inBulkBatches, selectionState } from './selection';

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
