import { describe, expect, it } from 'vitest';

import { indexEntriesSchema, parseIndexSearch } from './catalog-index';

const id = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e01';

const accepts = (kind: string, ids: string[]) =>
  indexEntriesSchema.safeParse({ kind, ids }).success;

describe('parseIndexSearch', () => {
  it('keeps the part of the index, the search and the filter', () => {
    expect(parseIndexSearch({ kind: 'series', q: ' ring ', unused: true })).toEqual({
      kind: 'series',
      q: 'ring',
      unused: true,
    });
  });

  it('drops what is empty or malformed', () => {
    expect(parseIndexSearch({ kind: 'genres', q: '', unused: 'yes' })).toEqual({});
    expect(parseIndexSearch({ unused: false })).toEqual({});
  });
});

describe('indexEntriesSchema', () => {
  it('accepts up to a hundred entries of a kind', () => {
    expect(accepts('authors', [id])).toBe(true);
    expect(accepts('genres', [id])).toBe(false);
    expect(accepts('authors', [])).toBe(false);
    expect(accepts('authors', ['tolkien'])).toBe(false);
    expect(
      accepts(
        'authors',
        Array.from({ length: 101 }, () => id),
      ),
    ).toBe(false);
  });
});
