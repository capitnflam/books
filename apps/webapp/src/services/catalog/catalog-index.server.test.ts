import { db } from '@books/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteIndexEntriesServer, listIndexServer } from './catalog-index.server';

const mocks = vi.hoisted(() => ({
  permissions: [] as string[],
  /** The rows each query returns, in the order they are sent. */
  results: [] as unknown[][],
  /** The SQL sent to the database. */
  queries: [] as string[],
}));

// The pool only connects at its first query, and none gets through.
vi.hoisted(() => vi.stubEnv('DATABASE_URL', 'postgresql://nowhere'));

vi.mock('#/services/access/access.server', () => ({
  requirePermissionServer: async (permission: string) => {
    if (!mocks.permissions.includes(permission)) {
      throw new Error(`Missing permission: ${permission}`);
    }
  },
}));

const uses: [kind: 'authors' | 'series' | 'publishers' | 'subjects', tables: string[]][] = [
  ['authors', ['book_contributors', 'edition_contributors']],
  ['series', ['book_series']],
  ['publishers', ['editions']],
  ['subjects', ['book_subjects']],
];

const notUsed = /not exists/u;

// The real query builder, so the SQL can be read, over a connection that answers `results`.
const { $client } = db as unknown as {
  $client: { query: (query: { text: string }) => Promise<{ rows: unknown[] }> };
};

vi.spyOn($client, 'query').mockImplementation(async ({ text }) => {
  mocks.queries.push(text);

  return { rows: mocks.results.shift() ?? [] };
});

beforeEach(() => {
  mocks.permissions = ['catalog:manage'];
  mocks.results = [];
  mocks.queries = [];
});

describe('listing the index', () => {
  it('counts the books using each entry of the page', async () => {
    mocks.results = [
      [
        ['ledoux', 'Francis Ledoux'],
        ['tolkien', 'J. R. R. Tolkien'],
      ],
      [[40]],
      [['tolkien', 3]],
    ];

    await expect(listIndexServer({ kind: 'authors' })).resolves.toEqual({
      total: 40,
      entries: [
        { id: 'ledoux', name: 'Francis Ledoux', bookCount: 0 },
        { id: 'tolkien', name: 'J. R. R. Tolkien', bookCount: 3 },
      ],
    });
  });

  it.each(uses)('counts the books of %s through %j', async (kind, tables) => {
    mocks.results = [[['entry', 'Entry']], [[1]], []];

    await listIndexServer({ kind });

    for (const table of tables) {
      expect(mocks.queries[2]).toContain(`from "books"."${table}"`);
    }
  });

  it('counts nothing for an empty page', async () => {
    mocks.results = [[], [[0]]];

    await expect(listIndexServer({ kind: 'series' })).resolves.toEqual({ total: 0, entries: [] });
    expect(mocks.queries).toHaveLength(2);
  });

  it('keeps only the entries no book uses when asked to', async () => {
    await listIndexServer({ kind: 'subjects' });
    expect(mocks.queries.filter((sql) => notUsed.test(sql))).toEqual([]);

    mocks.queries = [];
    await listIndexServer({ kind: 'subjects', unused: true });
    expect(mocks.queries).toEqual([expect.stringMatching(notUsed), expect.stringMatching(notUsed)]);
  });

  it('needs the catalog:manage permission', async () => {
    mocks.permissions = ['collection:manage'];

    await expect(listIndexServer({ kind: 'authors' })).rejects.toThrow(/catalog:manage/u);
    expect(mocks.queries).toEqual([]);
  });
});

describe('deleting entries of the index', () => {
  it('keeps the authors a book credits, and says how many', async () => {
    mocks.results = [[], [[2]]];

    await expect(
      deleteIndexEntriesServer({ kind: 'authors', ids: ['a', 'b', 'c'] }),
    ).resolves.toEqual({ kept: 2 });
    expect(mocks.queries[0]).toMatch(/^delete from "books"."authors"/u);
    expect(mocks.queries[0]).toMatch(notUsed);
  });

  it.each(['series', 'publishers', 'subjects'] as const)(
    'deletes %s even when books use them',
    async (kind) => {
      await expect(deleteIndexEntriesServer({ kind, ids: ['a'] })).resolves.toEqual({ kept: 0 });
      expect(mocks.queries).toEqual([
        `delete from "books"."${kind}" where "books"."${kind}"."id" in ($1)`,
      ]);
    },
  );

  it('needs the catalog:manage permission', async () => {
    mocks.permissions = ['collection:manage'];

    await expect(deleteIndexEntriesServer({ kind: 'authors', ids: ['a'] })).rejects.toThrow(
      /catalog:manage/u,
    );
    expect(mocks.queries).toEqual([]);
  });
});
