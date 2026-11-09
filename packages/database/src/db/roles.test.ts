import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from './permissions.ts';
import { ADMIN_ROLE_NAME, BUILT_IN_ROLES } from './roles.ts';

describe('built-in roles', () => {
  it('have unique names', () => {
    const names = BUILT_IN_ROLES.map((role) => role.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('have exactly one default role', () => {
    expect(BUILT_IN_ROLES.filter((role) => role.isDefault)).toHaveLength(1);
  });

  it('give the admin role every permission', () => {
    const admin = BUILT_IN_ROLES.find((role) => role.name === ADMIN_ROLE_NAME);

    expect(admin?.permissions).toEqual(PERMISSIONS);
  });
});
