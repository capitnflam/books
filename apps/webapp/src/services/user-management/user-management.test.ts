import { describe, expect, it } from 'vitest';

import {
  USERS_PAGE_SIZE,
  accountStatus,
  escapeLike,
  pageCount,
  parseUserListSearch,
  userListSearchSchema,
  userRoleSchema,
} from './user-management';

describe('parseUserListSearch', () => {
  it('keeps a trimmed query and a page after the first', () => {
    expect(parseUserListSearch({ q: '  Ada ', page: 3 })).toEqual({ q: 'Ada', page: 3 });
  });

  it('leaves out the defaults, so plain links need no search', () => {
    expect(parseUserListSearch({})).toEqual({ q: undefined, page: undefined });
    expect(parseUserListSearch({ q: '   ', page: 1 })).toEqual({ q: undefined, page: undefined });
  });

  it('drops malformed values instead of failing', () => {
    expect(parseUserListSearch({ q: 42, page: 'two' })).toEqual({ q: undefined, page: undefined });
    expect(parseUserListSearch({ page: 2.5 })).toEqual({ q: undefined, page: undefined });
    expect(parseUserListSearch({ page: -4 })).toEqual({ q: undefined, page: undefined });
  });

  it('shortens a very long query to one the server accepts', () => {
    const { q } = parseUserListSearch({ q: 'a'.repeat(500) });

    expect(userListSearchSchema.safeParse({ q }).success).toBe(true);
  });
});

describe('userRoleSchema', () => {
  it('requires a role: a user cannot be left without one', () => {
    const userId = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e01';

    expect(userRoleSchema.safeParse({ userId, roleId: null }).success).toBe(false);
    expect(userRoleSchema.safeParse({ userId }).success).toBe(false);
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

describe('accountStatus', () => {
  it('reads blocked or active from the Clerk account', () => {
    expect(accountStatus(true, { banned: true })).toBe('blocked');
    expect(accountStatus(true, { banned: false })).toBe('active');
  });

  it('tells a missing account apart from an unreachable Clerk', () => {
    expect(accountStatus(true, undefined)).toBe('no-account');
    expect(accountStatus(false, undefined)).toBe('unknown');
  });
});

describe('pageCount', () => {
  it('counts full and partial pages, with at least one', () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(USERS_PAGE_SIZE)).toBe(1);
    expect(pageCount(USERS_PAGE_SIZE + 1)).toBe(2);
  });
});
