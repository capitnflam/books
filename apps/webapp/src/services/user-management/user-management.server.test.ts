import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteUserServer, setRoleServer, setUserBlockedServer } from './user-management.server';

import type * as Database from '@books/database';

const admin = { id: '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e01' };
const reader = { id: '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e02', authenticationId: 'user_reader' };
const roleId = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e03';

const mocks = vi.hoisted(() => ({
  permissions: [] as string[],
  insertValues: vi.fn(),
  onConflictDoUpdate: vi.fn(),
  deleteWhere: vi.fn(),
  banUser: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock('#/services/access/access.server', () => ({
  requirePermissionServer: async (permission: string) => {
    if (!mocks.permissions.includes(permission)) {
      throw new Error(`Missing permission: ${permission}`);
    }

    return { user: admin, permissions: mocks.permissions };
  },
}));

vi.mock('@books/database', async (importOriginal) => ({
  ...(await importOriginal<typeof Database>()),
  db: {
    query: { users: { findFirst: async () => reader } },
    insert: () => ({
      values: (values: unknown) => {
        mocks.insertValues(values);

        return { onConflictDoUpdate: mocks.onConflictDoUpdate };
      },
    }),
    delete: () => ({ where: mocks.deleteWhere }),
  },
}));

vi.mock('@clerk/tanstack-react-start/server', () => ({
  clerkClient: () => ({ users: { banUser: mocks.banUser, deleteUser: mocks.deleteUser } }),
}));

vi.mock('#/config/env', () => ({ getServerEnv: () => ({ CLERK_SECRET_KEY: 'sk_test' }) }));

beforeEach(() => {
  mocks.permissions = ['users:read', 'users:manage', 'user-roles:manage'];
  vi.clearAllMocks();
});

describe('setting a role', () => {
  it('replaces the user’s role and records who granted it', async () => {
    await setRoleServer({ userId: reader.id, roleId });

    expect(mocks.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ userId: reader.id, roleId, grantedBy: admin.id }),
    );
    expect(mocks.onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ set: expect.objectContaining({ roleId, grantedBy: admin.id }) }),
    );
  });

  it('needs the user-roles:manage permission', async () => {
    mocks.permissions = ['users:read', 'users:manage'];

    await expect(setRoleServer({ userId: reader.id, roleId })).rejects.toThrow(
      /user-roles:manage/u,
    );
    expect(mocks.insertValues).not.toHaveBeenCalled();
    expect(mocks.deleteWhere).not.toHaveBeenCalled();
  });

  it('refuses to change the acting user’s own role', async () => {
    await expect(setRoleServer({ userId: admin.id, roleId })).rejects.toThrow(/your own/u);
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });
});

describe('account management', () => {
  it('blocks another user in Clerk', async () => {
    await setUserBlockedServer({ userId: reader.id, blocked: true });

    expect(mocks.banUser).toHaveBeenCalledWith(reader.authenticationId);
  });

  it('deletes another user in Clerk and locally', async () => {
    await deleteUserServer({ userId: reader.id });

    expect(mocks.deleteUser).toHaveBeenCalledWith(reader.authenticationId);
    expect(mocks.deleteWhere).toHaveBeenCalledOnce();
  });

  it('still deletes the local user when Clerk no longer has them', async () => {
    mocks.deleteUser.mockRejectedValueOnce(Object.assign(new Error('Not found'), { status: 404 }));

    await deleteUserServer({ userId: reader.id });

    expect(mocks.deleteWhere).toHaveBeenCalledOnce();
  });

  it('needs the users:manage permission', async () => {
    mocks.permissions = ['users:read', 'user-roles:manage'];

    await expect(setUserBlockedServer({ userId: reader.id, blocked: true })).rejects.toThrow(
      /users:manage/u,
    );
    await expect(deleteUserServer({ userId: reader.id })).rejects.toThrow(/users:manage/u);
    expect(mocks.banUser).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('refuses to block or delete the acting user', async () => {
    await expect(setUserBlockedServer({ userId: admin.id, blocked: true })).rejects.toThrow(
      /your own/u,
    );
    await expect(deleteUserServer({ userId: admin.id })).rejects.toThrow(/your own/u);
    expect(mocks.banUser).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });
});
