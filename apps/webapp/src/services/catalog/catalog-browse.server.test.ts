import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBookServer, listBooksServer } from './catalog-browse.server';

import type * as Database from '@books/database';

const mocks = vi.hoisted(() => ({
  permissions: null as string[] | null,
  /** What each select returns, in the order the code runs them. */
  selects: [] as unknown[][],
  books: [] as unknown[],
}));

vi.mock('#/services/access/access.server', () => ({
  requireViewerServer: async () => {
    if (!mocks.permissions) {
      throw new Error('Not signed in.');
    }

    return { user: { id: 'reader' }, permissions: mocks.permissions };
  },
}));

// A query: a promise of `result` whose every builder step returns the query itself.
const query = vi.hoisted(() => (result: unknown) => {
  const promise: Record<string, unknown> = Object.assign(Promise.resolve(result));

  for (const step of ['from', 'where', 'orderBy', 'limit', 'offset']) {
    promise[step] = () => promise;
  }

  return promise;
});

vi.mock('@books/database', async (importOriginal) => ({
  ...(await importOriginal<typeof Database>()),
  db: {
    select: () => query(mocks.selects.shift() ?? []),
    query: {
      books: { findFirst: async () => mocks.books[0], findMany: async () => mocks.books },
    },
  },
}));

const listed = (id: string, authors: string[], covers: (string | null)[]) => ({
  id,
  title: id,
  subtitle: null,
  firstPublishedYear: null,
  contributors: authors.map((name) => ({ author: { name } })),
  editions: covers.map((coverImageUrl) => ({ coverImageUrl })),
});

beforeEach(() => {
  mocks.permissions = ['collection:manage'];
  mocks.selects = [];
  mocks.books = [];
});

describe('listing the catalogue', () => {
  it('keeps the filing order of the page, with each book’s authors and first cover', async () => {
    mocks.selects = [[{ id: 'a' }, { id: 'b' }], [{ total: 40 }]];
    mocks.books = [
      listed('b', [], []),
      listed('a', ['Terry Pratchett', 'Neil Gaiman'], [null, 'https://example.org/a.jpg']),
    ];

    await expect(listBooksServer({})).resolves.toEqual({
      total: 40,
      books: [
        {
          id: 'a',
          title: 'a',
          subtitle: null,
          firstPublishedYear: null,
          authors: ['Terry Pratchett', 'Neil Gaiman'],
          coverImageUrl: 'https://example.org/a.jpg',
        },
        expect.objectContaining({ id: 'b', authors: [], coverImageUrl: null }),
      ],
    });
  });

  it('needs a signed-in reader', async () => {
    mocks.permissions = null;

    await expect(listBooksServer({})).rejects.toThrow(/signed in/u);
  });
});

describe('reading a book', () => {
  const saved = {
    id: 'book',
    title: 'Guards! Guards!',
    contributors: [],
    series: [
      { position: 8, series: { name: 'Discworld', sortName: 'Discworld' } },
      { position: 1, series: { name: 'City Watch', sortName: 'City Watch' } },
    ],
    subjects: [{ subject: { name: 'Humour' } }, { subject: { name: 'Dragons' } }],
    genres: [{ genre: 'humour' }, { genre: 'retired_genre' }, { genre: 'fantasy' }],
    editions: [],
  };

  it('sorts its series, subjects and genres, without a genre no longer in the code', async () => {
    mocks.books = [saved];

    const details = await getBookServer('book');

    expect(details?.book.series.map(({ series }) => series.name)).toEqual([
      'City Watch',
      'Discworld',
    ]);
    expect(details?.book.subjects.map(({ name }) => name)).toEqual(['Dragons', 'Humour']);
    expect(details?.book.genres).toEqual(['fantasy', 'humour']);
  });

  it('offers editing only to those who look after the catalogue', async () => {
    mocks.books = [saved];

    await expect(getBookServer('book')).resolves.toMatchObject({ can: { edit: false } });

    mocks.permissions = ['catalog:manage'];

    await expect(getBookServer('book')).resolves.toMatchObject({ can: { edit: true } });
  });

  it('returns nothing for a book that does not exist', async () => {
    await expect(getBookServer('book')).resolves.toBeNull();
  });

  it('needs a signed-in reader', async () => {
    mocks.permissions = null;

    await expect(getBookServer('book')).rejects.toThrow(/signed in/u);
  });
});
