import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createFeatureFlagServer,
  deleteFeatureFlagServer,
  grantFeatureFlagServer,
  revokeFeatureFlagServer,
  updateFeatureFlagServer,
} from './feature-flags.server';

import type * as Database from '@books/database';

const admin = { id: '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e01' };
const flagId = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e10';
const ada = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e11';
const ben = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e12';

const mocks = vi.hoisted(() => ({
  permissions: [] as string[],
  rows: [] as unknown[],
  insertValues: vi.fn(),
  onConflictDoNothing: vi.fn(),
  updateSet: vi.fn(),
  deleteWhere: vi.fn(),
}));

// What an insert, update or delete returns.
const returning = vi.hoisted(() => async () => mocks.rows);

vi.mock('#/services/access/access.server', () => ({
  requirePermissionServer: async (permission: string) => {
    if (!mocks.permissions.includes(permission)) {
      throw new Error(`Missing permission: ${permission}`);
    }

    return { user: admin, permissions: mocks.permissions };
  },
}));

vi.mock('#/services/user-management/user-management.server', () => ({
  loadAccountsServer: async () => ({ loaded: true, accounts: new Map() }),
}));

vi.mock('@books/database', async (importOriginal) => ({
  ...(await importOriginal<typeof Database>()),
  db: {
    insert: () => ({
      values: (values: unknown) => {
        mocks.insertValues(values);

        return {
          onConflictDoNothing: (options: unknown) => {
            mocks.onConflictDoNothing(options);

            return { returning };
          },
        };
      },
    }),
    update: () => ({
      set: (values: unknown) => {
        mocks.updateSet(values);

        return { where: () => ({ returning }) };
      },
    }),
    delete: () => ({
      where: (condition: unknown) => {
        mocks.deleteWhere(condition);

        return Object.assign(Promise.resolve(), { returning });
      },
    }),
  },
}));

beforeEach(() => {
  mocks.permissions = ['feature-flags:manage'];
  mocks.rows = [];
  vi.clearAllMocks();
});

describe('creating a flag', () => {
  const flag = { key: 'BOOK_SEARCH', description: null };

  it('returns the new flag’s id', async () => {
    mocks.rows = [{ id: flagId }];

    await expect(createFeatureFlagServer(flag)).resolves.toEqual({ id: flagId, error: null });
    expect(mocks.insertValues).toHaveBeenCalledWith(flag);
  });

  it('reports a key another flag already has', async () => {
    await expect(createFeatureFlagServer(flag)).resolves.toEqual({
      id: null,
      error: 'key-taken',
    });
  });

  it('needs the feature-flags:manage permission', async () => {
    mocks.permissions = ['users:read'];

    await expect(createFeatureFlagServer(flag)).rejects.toThrow(/feature-flags:manage/u);
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });
});

describe('granting a flag', () => {
  it('grants it to each user once and records who granted it', async () => {
    mocks.rows = [{ userId: ada }, { userId: ben }];

    await expect(grantFeatureFlagServer({ flagId, userIds: [ada, ben, ada] })).resolves.toEqual({
      count: 2,
    });
    expect(mocks.insertValues).toHaveBeenCalledWith([
      { userId: ada, featureFlagId: flagId, grantedBy: admin.id },
      { userId: ben, featureFlagId: flagId, grantedBy: admin.id },
    ]);
    // Users who already have it keep their grant.
    expect(mocks.onConflictDoNothing).toHaveBeenCalled();
  });

  it('needs the feature-flags:manage permission', async () => {
    mocks.permissions = [];

    await expect(grantFeatureFlagServer({ flagId, userIds: [ada] })).rejects.toThrow(
      /feature-flags:manage/u,
    );
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });
});

describe('revoking a flag', () => {
  it('reports how many users lost it', async () => {
    mocks.rows = [{ userId: ada }];

    await expect(revokeFeatureFlagServer({ flagId, userIds: [ada, ben] })).resolves.toEqual({
      count: 1,
    });
    expect(mocks.deleteWhere).toHaveBeenCalledOnce();
  });

  it('needs the feature-flags:manage permission', async () => {
    mocks.permissions = [];

    await expect(revokeFeatureFlagServer({ flagId, userIds: [ada] })).rejects.toThrow(
      /feature-flags:manage/u,
    );
    expect(mocks.deleteWhere).not.toHaveBeenCalled();
  });
});

describe('updating a flag', () => {
  it('saves the description', async () => {
    mocks.rows = [{ id: flagId }];

    await updateFeatureFlagServer({ flagId, description: 'Search' });

    expect(mocks.updateSet).toHaveBeenCalledWith({ description: 'Search' });
  });

  it('fails when the flag does not exist', async () => {
    await expect(updateFeatureFlagServer({ flagId, description: 'Search' })).rejects.toThrow(
      /not found/u,
    );
  });
});

describe('deleting a flag', () => {
  it('needs the feature-flags:manage permission', async () => {
    mocks.permissions = [];

    await expect(deleteFeatureFlagServer({ flagId })).rejects.toThrow(/feature-flags:manage/u);
    expect(mocks.deleteWhere).not.toHaveBeenCalled();
  });
});
