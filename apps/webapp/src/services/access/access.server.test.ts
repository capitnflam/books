import { isRedirect } from '@tanstack/react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkPermissionServer, requirePermissionServer } from './access.server';

import type * as Database from '@books/database';

const mocks = vi.hoisted(() => ({
  user: null as { id: string } | null,
  permissionRows: [] as { permission: string }[],
}));

// The permissions query: select distinct … from user_roles inner join role_permissions where …
vi.mock('@books/database', async (importOriginal) => ({
  ...(await importOriginal<typeof Database>()),
  db: {
    selectDistinct: () => ({
      from: () => ({ innerJoin: () => ({ where: async () => mocks.permissionRows }) }),
    }),
  },
}));

vi.mock('#/services/users/users.server', () => ({
  getAuthenticatedUserServer: async () => mocks.user,
}));

vi.mock('#/services/authentication/authentication.server', () => ({
  checkIsAuthenticatedServer: async () => undefined,
}));

const reader = { id: '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e01' };

beforeEach(() => {
  mocks.user = reader;
  mocks.permissionRows = [];
});

describe('requirePermissionServer', () => {
  it('rejects a visitor who is not signed in', async () => {
    mocks.user = null;

    await expect(requirePermissionServer('users:read')).rejects.toThrow(/users:read/u);
  });

  it('rejects a user whose roles lack the permission', async () => {
    mocks.permissionRows = [{ permission: 'collection:manage' }];

    await expect(requirePermissionServer('users:manage')).rejects.toThrow(/users:manage/u);
  });

  it('returns the user and their sorted permissions when they hold it', async () => {
    mocks.permissionRows = [{ permission: 'users:manage' }, { permission: 'users:read' }];

    await expect(requirePermissionServer('users:read')).resolves.toEqual({
      user: reader,
      permissions: ['users:read', 'users:manage'],
    });
  });

  it('ignores a permission no longer in the code', async () => {
    mocks.permissionRows = [{ permission: 'retired:permission' }];

    await expect(requirePermissionServer('retired:permission' as never)).rejects.toThrow(
      /retired:permission/u,
    );
  });
});

describe('checkPermissionServer', () => {
  it('lets a user with the permission through', async () => {
    mocks.permissionRows = [{ permission: 'users:read' }];

    await expect(checkPermissionServer('users:read', '/users')).resolves.toBeUndefined();
  });

  it('sends a user without the permission to the forbidden page', async () => {
    mocks.permissionRows = [{ permission: 'collection:manage' }];

    const error: unknown = await checkPermissionServer('users:read', '/users').catch(
      (error_: unknown) => error_,
    );

    expect(isRedirect(error)).toBe(true);
    expect(error).toMatchObject({ options: { to: '/forbidden' } });
  });
});
