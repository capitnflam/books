import { describe, expect, it } from 'vitest';

import { accountStatus, userRoleSchema } from './user-management';

describe('userRoleSchema', () => {
  it('requires a role: a user cannot be left without one', () => {
    const userId = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e01';

    expect(userRoleSchema.safeParse({ userId, roleId: null }).success).toBe(false);
    expect(userRoleSchema.safeParse({ userId }).success).toBe(false);
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
