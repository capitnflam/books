import { describe, expect, it } from 'vitest';

import {
  USERS_PAGE_SIZE,
  accountStatus,
  escapeLike,
  nextPage,
  parseUserListSearch,
  userListSearchSchema,
  userRoleSchema,
} from './user-management';

describe('parseUserListSearch', () => {
  it('keeps a trimmed query', () => {
    expect(parseUserListSearch({ q: '  Ada ' })).toEqual({ q: 'Ada' });
  });

  it('leaves out an empty or malformed query, so plain links need no search', () => {
    expect(parseUserListSearch({})).toEqual({ q: undefined });
    expect(parseUserListSearch({ q: '   ' })).toEqual({ q: undefined });
    expect(parseUserListSearch({ q: 42 })).toEqual({ q: undefined });
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

describe('nextPage', () => {
  it('asks for the next page until every user is loaded', () => {
    expect(nextPage(1, USERS_PAGE_SIZE + 1)).toBe(2);
    expect(nextPage(1, USERS_PAGE_SIZE)).toBeUndefined();
    expect(nextPage(1, 0)).toBeUndefined();
    expect(nextPage(2, 3 * USERS_PAGE_SIZE)).toBe(3);
  });
});
