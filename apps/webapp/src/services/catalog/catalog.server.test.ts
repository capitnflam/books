import { schema } from '@books/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createBookSchema,
  editionFormOf,
  emptyBookForm,
  updateBookSchema,
  updateEditionSchema,
} from './catalog';
import {
  createBookServer,
  lookupIsbnServer,
  updateBookServer,
  updateEditionServer,
} from './catalog.server';

import type { BookForm, EditionForm, WorkForm } from './catalog';
import type * as Database from '@books/database';

const mocks = vi.hoisted(() => ({
  permissions: [] as string[],
  /** What each select returns, in the order the code runs them. */
  selects: [] as unknown[][],
  inserts: [] as { table: unknown; values: unknown }[],
  updates: [] as { table: unknown; values: unknown }[],
  deletes: [] as unknown[],
  /** The book as it is before an edit. */
  savedBook: null as unknown,
  /** Makes the next update fail, as another save taking the ISBN does. */
  updateError: null as unknown,
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

  for (const step of [
    'from',
    'innerJoin',
    'where',
    'orderBy',
    'limit',
    'for',
    'onConflictDoNothing',
  ]) {
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
    update: (table: unknown) => ({
      set: (values: unknown) => ({
        where: async () => {
          if (mocks.updateError) {
            throw mocks.updateError;
          }

          mocks.updates.push({ table, values });
        },
      }),
    }),
    delete: (table: unknown) => ({
      where: async () => {
        mocks.deletes.push(table);
      },
    }),
    query: { books: { findFirst: async () => mocks.savedBook } },
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
  mocks.updates = [];
  mocks.deletes = [];
  mocks.savedBook = null;
  mocks.updateError = null;
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

const BOOK_ID = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e01';
const EDITION_ID = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e02';

const savedBook = () => ({
  id: BOOK_ID,
  title: 'The Colour of Magic',
  sortTitle: 'Colour of Magic, The',
  originalLanguage: 'en',
  // Not the oldest author of that name in the catalogue.
  contributors: [{ role: 'author', author: { id: 'homonym', name: 'Terry Pratchett' } }],
  series: [
    { position: 1, series: { id: 'discworld', name: 'Discworld' } },
    { position: 2, series: { id: 'rincewind', name: 'Rincewind' } },
  ],
  editions: [
    {
      id: EDITION_ID,
      title: null,
      language: 'en',
      contributors: [{ role: 'narrator', author: { id: 'planer', name: 'Nigel Planer' } }],
    },
  ],
});

const work = (changes: Partial<WorkForm>) =>
  updateBookSchema.parse({
    ...emptyBookForm(),
    bookId: BOOK_ID,
    title: 'The Colour of Magic',
    contributors: [{ name: 'terry pratchett', role: 'author' }],
    series: [
      { name: 'Discworld', position: '1' },
      { name: 'Rincewind', position: '2' },
    ],
    genres: ['fantasy'],
    ...changes,
  });

const updatesOf = (table: unknown) =>
  mocks.updates.filter((update) => update.table === table).map(({ values }) => values);

describe('editing a book', () => {
  beforeEach(() => {
    mocks.selects = [[{ id: BOOK_ID }]];
    mocks.savedBook = savedBook();
  });

  it('replaces the credits, series, genres and subjects, and touches no edition', async () => {
    mocks.selects.push(
      // The illustrator is new, and so is the subject.
      [],
      [],
      [{ id: 'wizards', name: 'Wizards' }],
    );

    await expect(
      updateBookServer(
        work({
          subtitle: 'A Discworld Novel',
          contributors: [
            { name: 'Terry Pratchett', role: 'author' },
            { name: 'Josh Kirby', role: 'illustrator' },
          ],
          genres: ['fantasy', 'humour'],
          subjects: 'Wizards',
        }),
      ),
    ).resolves.toEqual({ error: null });

    expect(updatesOf(schema.books)).toEqual([
      expect.objectContaining({
        title: 'The Colour of Magic',
        subtitle: 'A Discworld Novel',
        sortTitle: 'Colour of Magic, The',
      }),
    ]);
    expect(mocks.deletes).toEqual([
      schema.bookContributors,
      schema.bookSeries,
      schema.bookGenres,
      schema.bookSubjects,
    ]);
    expect(insertsInto(schema.bookContributors)).toEqual([
      [
        { bookId: BOOK_ID, authorId: 'homonym', role: 'author', position: 0 },
        { bookId: BOOK_ID, authorId: 'id-1', role: 'illustrator', position: 1 },
      ],
    ]);
    expect(insertsInto(schema.bookSeries)).toEqual([
      [
        { bookId: BOOK_ID, seriesId: 'discworld', position: 1 },
        { bookId: BOOK_ID, seriesId: 'rincewind', position: 2 },
      ],
    ]);
    expect(insertsInto(schema.bookGenres)).toEqual([
      [
        { bookId: BOOK_ID, genre: 'fantasy' },
        { bookId: BOOK_ID, genre: 'humour' },
      ],
    ]);
    expect(insertsInto(schema.bookSubjects)).toEqual([[{ bookId: BOOK_ID, subjectId: 'wizards' }]]);
    expect(updatesOf(schema.editions)).toEqual([]);
    expect(insertsInto(schema.editionContributors)).toEqual([]);
  });

  it('keeps the credited author, whatever other authors have that name', async () => {
    await updateBookServer(work({}));

    expect(insertsInto(schema.authors)).toEqual([]);
    expect(insertsInto(schema.bookContributors)).toEqual([
      [{ bookId: BOOK_ID, authorId: 'homonym', role: 'author', position: 0 }],
    ]);
  });

  it('keeps a translator the work credits on the work', async () => {
    mocks.selects.push([{ id: 'translator' }]);

    await updateBookServer(
      work({ contributors: [{ name: 'Andreas Brandhorst', role: 'translator' }] }),
    );

    expect(insertsInto(schema.bookContributors)).toEqual([
      [{ bookId: BOOK_ID, authorId: 'translator', role: 'translator', position: 0 }],
    ]);
  });

  it('removes what was emptied, and keeps a series entered twice once', async () => {
    await updateBookServer(
      work({
        contributors: [{ name: ' ', role: 'author' }],
        series: [
          { name: 'Discworld', position: '1' },
          { name: 'DISCWORLD', position: '3' },
        ],
      }),
    );

    expect(mocks.deletes).toContain(schema.bookContributors);
    expect(insertsInto(schema.bookContributors)).toEqual([]);
    expect(insertsInto(schema.bookSeries)).toEqual([
      [{ bookId: BOOK_ID, seriesId: 'discworld', position: 1 }],
    ]);
    expect(insertsInto(schema.bookSubjects)).toEqual([]);
  });

  it('says when the book is gone', async () => {
    mocks.selects = [[]];

    await expect(updateBookServer(work({}))).resolves.toEqual({ error: 'not-found' });
    expect(mocks.updates).toEqual([]);
    expect(mocks.deletes).toEqual([]);
  });

  it('needs the catalog:manage permission', async () => {
    mocks.permissions = ['collection:manage'];

    await expect(updateBookServer(work({}))).rejects.toThrow(/catalog:manage/u);
    expect(mocks.updates).toEqual([]);
  });
});

const edition = (changes: Partial<EditionForm>) =>
  updateEditionSchema.parse({
    ...editionFormOf({
      title: null,
      subtitle: null,
      editionStatement: null,
      publisher: null,
      publishedYear: null,
      publishedOn: null,
      isbn13: null,
      isbn10: null,
      language: 'en',
      format: null,
      pageCount: null,
      durationMinutes: null,
      coverImageUrl: null,
      contributors: [],
    }),
    editionId: EDITION_ID,
    ...changes,
  });

describe('editing an edition', () => {
  beforeEach(() => {
    mocks.selects = [[{ bookId: BOOK_ID }], [{ id: BOOK_ID }]];
    mocks.savedBook = savedBook();
  });

  it('saves the edition and its credits, and leaves the book alone', async () => {
    mocks.selects = [
      // No other edition has the ISBN.
      [],
      ...mocks.selects,
      [{ id: 'corgi', name: 'Corgi' }],
    ];

    await expect(
      updateEditionServer(
        edition({
          isbn: '0-552-12475-3',
          publisher: 'corgi',
          published: '1985-01-18',
          format: 'audiobook',
          pageCount: '288',
          durationMinutes: '426',
          contributors: [{ name: 'Nigel Planer', role: 'narrator' }],
        }),
      ),
    ).resolves.toEqual({ error: null });

    expect(updatesOf(schema.editions)).toEqual([
      expect.objectContaining({
        isbn10: '0552124753',
        publisherId: 'corgi',
        publishedYear: 1985,
        publishedOn: '1985-01-18',
        format: 'audiobook',
        pageCount: null,
        durationMinutes: 426,
      }),
    ]);
    expect(updatesOf(schema.books)).toEqual([]);
    expect(mocks.deletes).toEqual([schema.editionContributors]);
    expect(insertsInto(schema.editionContributors)).toEqual([
      [{ editionId: EDITION_ID, authorId: 'planer', role: 'narrator', position: 0 }],
    ]);
    expect(insertsInto(schema.bookContributors)).toEqual([]);
  });

  it('files the book again when the language of its title changes', async () => {
    mocks.savedBook = {
      ...savedBook(),
      title: 'Die Farben der Magie',
      sortTitle: 'Die Farben der Magie',
    };

    await updateEditionServer(edition({ language: 'de' }));

    expect(updatesOf(schema.books)).toEqual([{ sortTitle: 'Farben der Magie, Die' }]);
  });

  it('refuses an ISBN another edition has', async () => {
    mocks.selects = [[{ bookId: 'hobbit', title: 'The Hobbit' }]];

    await expect(updateEditionServer(edition({ isbn: '9780261102217' }))).resolves.toEqual({
      error: 'isbn-taken',
      bookId: 'hobbit',
      title: 'The Hobbit',
    });
    expect(mocks.updates).toEqual([]);
  });

  it('refuses an ISBN another edition takes meanwhile', async () => {
    mocks.selects = [[], ...mocks.selects, [{ bookId: 'hobbit', title: 'The Hobbit' }]];
    mocks.updateError = Object.assign(new Error('duplicate key'), { code: '23505' });

    await expect(updateEditionServer(edition({ isbn: '9780261102217' }))).resolves.toEqual({
      error: 'isbn-taken',
      bookId: 'hobbit',
      title: 'The Hobbit',
    });
  });

  it('says when the edition is gone', async () => {
    mocks.selects = [[]];

    await expect(updateEditionServer(edition({}))).resolves.toEqual({ error: 'not-found' });
    expect(mocks.updates).toEqual([]);
  });

  it('needs the catalog:manage permission', async () => {
    mocks.permissions = ['collection:manage'];

    await expect(updateEditionServer(edition({}))).rejects.toThrow(/catalog:manage/u);
    expect(mocks.updates).toEqual([]);
  });
});
