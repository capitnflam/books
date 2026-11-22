import { describe, expect, it } from 'vitest';

import { PAGE_SIZE, escapeLike, listSearchSchema, nextPage, parseListSearch } from './list-search';

describe('parseListSearch', () => {
  it('keeps a trimmed query', () => {
    expect(parseListSearch({ q: '  Ada ' })).toEqual({ q: 'Ada' });
  });

  it('leaves out an empty or malformed query, so plain links need no search', () => {
    expect(parseListSearch({})).toEqual({ q: undefined });
    expect(parseListSearch({ q: '   ' })).toEqual({ q: undefined });
    expect(parseListSearch({ q: ['Ada'] })).toEqual({ q: undefined });
  });

  it('keeps a query of digits, which the router reads as a number', () => {
    expect(parseListSearch({ q: 9_780_261_102_217 })).toEqual({ q: '9780261102217' });
  });

  it('shortens a very long query to one the server accepts', () => {
    const { q } = parseListSearch({ q: 'a'.repeat(500) });

    expect(listSearchSchema.safeParse({ q }).success).toBe(true);
  });
});

describe('escapeLike', () => {
  it('escapes the LIKE wildcards and the escape character', () => {
    expect(escapeLike(String.raw`50%_off\now`)).toBe(String.raw`50\%\_off\\now`);
  });

  it('leaves other text alone', () => {
    expect(escapeLike('Ada Lovelace')).toBe('Ada Lovelace');
  });
});

describe('nextPage', () => {
  it('asks for the next page until every row is loaded', () => {
    expect(nextPage(1, PAGE_SIZE + 1)).toBe(2);
    expect(nextPage(1, PAGE_SIZE)).toBeUndefined();
    expect(nextPage(1, 0)).toBeUndefined();
    expect(nextPage(2, 3 * PAGE_SIZE)).toBe(3);
  });
});
