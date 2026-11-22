import { schema } from '@books/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createBookSchema, emptyBookForm } from './catalog';
import { createBookServer, lookupIsbnServer } from './catalog.server';

import type { BookForm } from './catalog';
import type * as Database from '@books/database';

const mocks = vi.hoisted(() => ({
  permissions: [] as string[],
  /** What each select returns, in the order the code runs them. */
  selects: [] as unknown[][],
  inserts: [] as { table: unknown; values: unknown }[],
  lookupIsbnOnline: vi.fn(),
}));

vi.mock('#/services/access/access.server', () => ({
  requirePermissionServer: async (permission: string) => {
    if (!mocks.permissions.includes(permission)) {
      throw new Error(`Missing permission: ${permission}`);
    }

    return { user: { id: 'moderator' }, permissions: mocks.permissions };
  },
}));

vi.mock('./isbn-lookup.server', () => ({ lookupIsbnOnline: mocks.lookupIsbnOnline }));

// A query: a promise of `result` whose every builder step returns the query itself.
const query = vi.hoisted(() => (result: unknown, steps: Record<string, unknown> = {}) => {
  const promise: Record<string, unknown> = Object.assign(Promise.resolve(result), steps);

  for (const step of ['from', 'innerJoin', 'where', 'orderBy', 'limit', 'onConflictDoNothing']) {
    promise[step] = () => promise;
  }

  return promise;
});

vi.mock('@books/database', async (importOriginal) => {
  const db = {
    select: () => query(mocks.selects.shift() ?? []),
    insert: (table: unknown) => ({
      values: (values: unknown) => {
        mocks.inserts.push({ table, values });

        const id = `id-${mocks.inserts.length}`;

        return query(undefined, { returning: async () => [{ id }] });
      },
    }),
    transaction: async (run: (tx: unknown) => Promise<unknown>) => run(db),
  };

  return { ...(await importOriginal<typeof Database>()), db };
});

const insertsInto = (table: unknown) =>
  mocks.inserts.filter((insert) => insert.table === table).map(({ values }) => values);

const book = (changes: Partial<BookForm>) =>
  createBookSchema.parse({
    ...emptyBookForm(),
    title: 'The Hobbit',
    genres: ['fantasy'],
    ...changes,
  });

beforeEach(() => {
  mocks.permissions = ['catalog:manage'];
  mocks.selects = [];
  mocks.inserts = [];
  mocks.lookupIsbnOnline.mockReset();
});

describe('looking up an ISBN', () => {
  it('refuses an invalid ISBN without asking anyone', async () => {
    await expect(lookupIsbnServer('978-0-261-10221-8', {})).resolves.toEqual({
      status: 'invalid',
    });
    expect(mocks.lookupIsbnOnline).not.toHaveBeenCalled();
  });

  it('points to the edition already in the catalogue', async () => {
    mocks.selects = [[{ bookId: 'hobbit', title: 'The Hobbit' }]];

    await expect(lookupIsbnServer('0-261-10221-4', {})).resolves.toEqual({
      status: 'exists',
      bookId: 'hobbit',
      title: 'The Hobbit',
    });
    expect(mocks.lookupIsbnOnline).not.toHaveBeenCalled();
  });

  it('returns what the open catalogues found, with the ISBN-13', async () => {
    mocks.lookupIsbnOnline.mockResolvedValue({ status: 'found', draft: { title: 'The Hobbit' } });

    await expect(lookupIsbnServer('0-261-10221-4', { googleBooksApiKey: 'key' })).resolves.toEqual({
      status: 'found',
      draft: { title: 'The Hobbit' },
      isbn: '9780261102217',
    });
    expect(mocks.lookupIsbnOnline).toHaveBeenCalledWith(
      { isbn13: '9780261102217', isbn10: '0261102214' },
      { googleBooksApiKey: 'key' },
    );
  });

  it('needs the catalog:manage permission', async () => {
    mocks.permissions = ['collection:manage'];

    await expect(lookupIsbnServer('9780261102217', {})).rejects.toThrow(/catalog:manage/u);
  });
});

describe('creating a book', () => {
  it('saves the work, its edition, credits, publisher, series and subjects', async () => {
    mocks.selects = [
      // No edition has the ISBN yet.
      [],
      // The publisher is already catalogued.
      [{ id: 'harpercollins', name: 'HarperCollins' }],
      // Tolkien is already catalogued; Anderson and Ledoux are not.
      [{ id: 'tolkien' }],
      [],
      [],
      // No series by that name yet.
      [],
      // Subjects: "fantasy" exists in lower case; "Dragons" doesn't, so it is created and
      // looked up again.
      [{ id: 'fantasy', name: 'fantasy' }],
      [
        { id: 'fantasy', name: 'fantasy' },
        { id: 'dragons', name: 'Dragons' },
      ],
    ];

    const result = await createBookServer(
      book({
        // A French edition: its title and series are filed by French articles.
        title: 'Le Hobbit',
        isbn: '9780261102217',
        contributors: [
          { name: 'J.R.R. Tolkien', role: 'author' },
          { name: 'Douglas A. Anderson', role: 'introduction' },
          { name: 'Francis Ledoux', role: 'translator' },
          { name: 'J.R.R. Tolkien', role: 'author' },
        ],
        originalLanguage: 'en',
        firstPublishedYear: '1937',
        series: 'Le Seigneur des anneaux',
        seriesPosition: '0',
        genres: ['fantasy', 'humour'],
        subjects: 'Fantasy, Dragons',
        publisher: 'HarperCollins',
        published: '2009',
        language: 'fr',
        format: 'paperback',
        pageCount: '310',
      }),
    );

    expect(result).toEqual({ error: null, bookId: 'id-1', title: 'Le Hobbit' });
    expect(insertsInto(schema.books)).toEqual([
      {
        title: 'Le Hobbit',
        subtitle: null,
        sortTitle: 'Hobbit, Le',
        description: null,
        originalLanguage: 'en',
        firstPublishedYear: 1937,
      },
    ]);
    // An existing publisher is reused, not inserted again.
    expect(insertsInto(schema.publishers)).toEqual([]);
    expect(insertsInto(schema.editions)).toEqual([
      expect.objectContaining({
        bookId: 'id-1',
        publisherId: 'harpercollins',
        publishedYear: 2009,
        publishedOn: null,
        isbn13: '9780261102217',
        isbn10: '0261102214',
        language: 'fr',
        format: 'paperback',
        pageCount: 310,
      }),
    ]);
    // Only new authors are created, filed by surname.
    expect(insertsInto(schema.authors)).toEqual([
      { name: 'Douglas A. Anderson', sortName: 'Anderson, Douglas A.' },
      { name: 'Francis Ledoux', sortName: 'Ledoux, Francis' },
    ]);
    // The work's credits and the edition's are numbered apart; a repeated credit is dropped.
    expect(insertsInto(schema.bookContributors)).toEqual([
      [
        { bookId: 'id-1', authorId: 'tolkien', role: 'author', position: 0 },
        { bookId: 'id-1', authorId: 'id-3', role: 'introduction', position: 1 },
      ],
    ]);
    expect(insertsInto(schema.editionContributors)).toEqual([
      [{ editionId: 'id-2', authorId: 'id-4', role: 'translator', position: 0 }],
    ]);
    expect(insertsInto(schema.series)).toEqual([
      { name: 'Le Seigneur des anneaux', sortName: 'Seigneur des anneaux, Le' },
    ]);
    expect(insertsInto(schema.bookSeries)).toEqual([
      { bookId: 'id-1', seriesId: 'id-7', position: 0 },
    ]);
    expect(insertsInto(schema.bookGenres)).toEqual([
      [
        { bookId: 'id-1', genre: 'fantasy' },
        { bookId: 'id-1', genre: 'humour' },
      ],
    ]);
    // Only the subject missing in any case is created.
    expect(insertsInto(schema.subjects)).toEqual([[{ name: 'Dragons' }]]);
    expect(insertsInto(schema.bookSubjects)).toEqual([
      [
        { bookId: 'id-1', subjectId: 'fantasy' },
        { bookId: 'id-1', subjectId: 'dragons' },
      ],
    ]);
  });

  it('saves a book with only a title and a genre, and nothing else', async () => {
    await expect(createBookServer(book({}))).resolves.toMatchObject({ error: null });
    expect(mocks.inserts.map(({ table }) => table)).toEqual([
      schema.books,
      schema.editions,
      schema.bookGenres,
    ]);
  });

  it('refuses an ISBN another edition has', async () => {
    mocks.selects = [[{ bookId: 'hobbit', title: 'The Hobbit' }]];

    await expect(createBookServer(book({ isbn: '9780261102217' }))).resolves.toEqual({
      error: 'isbn-taken',
      bookId: 'hobbit',
      title: 'The Hobbit',
    });
    expect(mocks.inserts).toEqual([]);
  });

  it('needs the catalog:manage permission', async () => {
    mocks.permissions = ['collection:manage'];

    await expect(createBookServer(book({}))).rejects.toThrow(/catalog:manage/u);
    expect(mocks.inserts).toEqual([]);
  });
});
