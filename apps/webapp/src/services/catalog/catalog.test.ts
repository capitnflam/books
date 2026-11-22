import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  applyLookup,
  bookCover,
  bookFormErrors,
  createBookSchema,
  editionDraftOf,
  editionFormErrors,
  editionFormOf,
  emptyBookForm,
  emptySeries,
  refiledTitle,
  sortName,
  sortTitle,
  updateBookSchema,
  updateEditionSchema,
  workFormErrors,
  workFormOf,
} from './catalog';

import type { BookForm } from './catalog';

const form = (changes: Partial<BookForm>): BookForm => ({
  ...emptyBookForm(),
  title: 'The Hobbit',
  genres: ['fantasy'],
  ...changes,
});

describe('sortTitle', () => {
  it('files an English title after its leading article', () => {
    expect(sortTitle('The Hobbit')).toBe('Hobbit, The');
    expect(sortTitle('A Wizard of Earthsea', 'en')).toBe('Wizard of Earthsea, A');
    expect(sortTitle('An Instance of the Fingerpost')).toBe('Instance of the Fingerpost, An');
  });

  it('uses the articles of the title’s language', () => {
    expect(sortTitle('Le Petit Prince', 'fr')).toBe('Petit Prince, Le');
    expect(sortTitle('L’Étranger', 'fr')).toBe('Étranger, L’');
    expect(sortTitle('Der Zauberberg', 'de')).toBe('Zauberberg, Der');
    expect(sortTitle('El Aleph', 'es-AR')).toBe('Aleph, El');
  });

  it('leaves a title without an article, or that is only an article, as it is', () => {
    expect(sortTitle('Ficciones', 'es')).toBe('Ficciones');
    expect(sortTitle('Theory of Everything')).toBe('Theory of Everything');
    expect(sortTitle('The')).toBe('The');
    expect(sortTitle('Le Petit Prince', 'en')).toBe('Le Petit Prince');
  });
});

describe('sortName', () => {
  it('files a name under the surname', () => {
    expect(sortName('Jorge Luis Borges')).toBe('Borges, Jorge Luis');
    expect(sortName('J.R.R. Tolkien')).toBe('Tolkien, J.R.R.');
  });

  it('keeps particles and suffixes with the surname', () => {
    expect(sortName('Ursula K. Le Guin')).toBe('Le Guin, Ursula K.');
    expect(sortName('Simone de Beauvoir')).toBe('de Beauvoir, Simone');
    expect(sortName('Martin Luther King Jr.')).toBe('King, Martin Luther, Jr.');
  });

  it('leaves a single name, or one already inverted, as it is', () => {
    expect(sortName('Homer')).toBe('Homer');
    expect(sortName('Borges, Jorge Luis')).toBe('Borges, Jorge Luis');
  });
});

describe('createBookSchema', () => {
  it('turns the form into the values to save', () => {
    expect(
      createBookSchema.parse(
        form({
          isbn: '978-0-261-10221-7',
          subtitle: '  ',
          contributors: [
            { name: ' J.R.R. Tolkien ', role: 'author' },
            { name: '', role: 'illustrator' },
          ],
          firstPublishedYear: '1937',
          series: 'Middle-earth',
          seriesPosition: '0,5',
          genres: ['fantasy', 'children', 'fantasy'],
          subjects: 'Fantasy, fantasy ,  Dragons ,,',
          published: '1991-09-21',
          language: 'en',
          format: 'paperback',
          pageCount: '310',
          coverImageUrl: 'https://covers.openlibrary.org/b/id/1-L.jpg',
        }),
      ),
    ).toEqual({
      isbn: { isbn13: '9780261102217', isbn10: '0261102214' },
      title: 'The Hobbit',
      subtitle: null,
      contributors: [{ name: 'J.R.R. Tolkien', role: 'author' }],
      description: null,
      originalLanguage: null,
      firstPublishedYear: 1937,
      series: 'Middle-earth',
      seriesPosition: 0.5,
      genres: ['fantasy', 'children'],
      subjects: ['Fantasy', 'Dragons'],
      editionStatement: null,
      publisher: null,
      published: { publishedYear: 1991, publishedOn: '1991-09-21' },
      language: 'en',
      format: 'paperback',
      pageCount: 310,
      durationMinutes: null,
      coverImageUrl: 'https://covers.openlibrary.org/b/id/1-L.jpg',
    });
  });

  it('saves a book with only a title', () => {
    expect(createBookSchema.parse(form({}))).toMatchObject({
      isbn: null,
      contributors: [],
      published: { publishedYear: null, publishedOn: null },
      format: null,
      coverImageUrl: null,
    });
  });

  it('reads a year alone as the published year', () => {
    expect(createBookSchema.parse(form({ published: '1937' })).published).toEqual({
      publishedYear: 1937,
      publishedOn: null,
    });
  });
});

describe('bookFormErrors', () => {
  it('finds nothing to correct in a valid form', () => {
    expect(bookFormErrors(form({ isbn: '0261102214', pageCount: '310' }))).toEqual(new Set());
  });

  it('names each field the server would refuse', () => {
    expect(
      bookFormErrors(
        form({
          isbn: '9780261102218',
          title: '  ',
          contributors: [{ name: 'a'.repeat(201), role: 'author' }],
          firstPublishedYear: '19th century',
          seriesPosition: '2',
          genres: [],
          published: '1937-02-30',
          language: 'English',
          pageCount: '0',
          coverImageUrl: 'javascript:alert(1)',
        }),
      ),
    ).toEqual(
      new Set([
        'isbn',
        'title',
        'contributors[0].name',
        'firstPublishedYear',
        'published',
        'language',
        'pageCount',
        'coverImageUrl',
        'seriesPosition',
        'genres',
      ]),
    );
  });
});

describe('bookFormErrors, for fields with several values', () => {
  it('reports an invalid subject on the Subjects field', () => {
    expect(bookFormErrors(form({ subjects: `Fantasy, ${'a'.repeat(101)}` }))).toEqual(
      new Set(['subjects']),
    );
  });

  it('reports too many contributors on the list, and a bad name on its row', () => {
    const many = Array.from({ length: 21 }, (_, index) => ({
      name: `Author ${index}`,
      role: 'author' as const,
    }));

    expect(bookFormErrors(form({ contributors: many }))).toEqual(new Set(['contributors']));
    expect(
      bookFormErrors(form({ contributors: [{ name: 'a'.repeat(201), role: 'author' }] })),
    ).toEqual(new Set(['contributors[0].name']));
  });
});

describe('the page count and running time', () => {
  it('checks and saves only the one the format shows', () => {
    // Pages are hidden for an audiobook, the running time for every other format.
    expect(bookFormErrors(form({ format: 'audiobook', pageCount: '0' }))).toEqual(new Set());
    expect(bookFormErrors(form({ format: 'paperback', durationMinutes: 'abc' }))).toEqual(
      new Set(),
    );
    expect(
      createBookSchema.parse(
        form({ format: 'audiobook', pageCount: '310', durationMinutes: '660' }),
      ),
    ).toMatchObject({ pageCount: null, durationMinutes: 660 });
    expect(
      createBookSchema.parse(form({ format: '', pageCount: '310', durationMinutes: '660' })),
    ).toMatchObject({ pageCount: 310, durationMinutes: null });
  });
});

describe('the first publication year', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts next year at the latest, as of the day the form is checked', () => {
    vi.useFakeTimers({ now: new Date('2026-12-31T12:00:00Z') });
    expect(bookFormErrors(form({ firstPublishedYear: '2027' }))).toEqual(new Set());
    expect(bookFormErrors(form({ firstPublishedYear: '2028' }))).toEqual(
      new Set(['firstPublishedYear']),
    );

    // A server still running after New Year moves the limit with it.
    vi.setSystemTime(new Date('2027-01-02T12:00:00Z'));
    expect(bookFormErrors(form({ firstPublishedYear: '2028' }))).toEqual(new Set());
  });
});

describe('applyLookup', () => {
  const discworld = {
    title: 'The Colour of Magic',
    series: 'Discworld',
    seriesPosition: '1',
    coverImageUrl: 'https://covers.example/1.jpg',
  };

  it('fills the form with what the lookup found, with the ISBN-13', () => {
    expect(
      applyLookup(emptyBookForm(), emptyBookForm(), null, discworld, '9780552166591'),
    ).toMatchObject({
      ...discworld,
      isbn: '9780552166591',
    });
  });

  it('empties what the previous lookup filled when another book is looked up', () => {
    const first = applyLookup(emptyBookForm(), emptyBookForm(), null, discworld, '9780552166591');
    const second = applyLookup(
      first,
      emptyBookForm(),
      discworld,
      { title: 'Ficciones' },
      '9780802130303',
    );

    expect(second).toMatchObject({
      title: 'Ficciones',
      series: '',
      seriesPosition: '',
      coverImageUrl: '',
      isbn: '9780802130303',
    });
  });

  it('keeps what the reader changed or typed since', () => {
    const first = applyLookup(emptyBookForm(), emptyBookForm(), null, discworld, '9780552166591');
    const edited = { ...first, series: 'The Discworld', description: 'My notes' };
    const second = applyLookup(edited, emptyBookForm(), discworld, {}, '9780802130303');

    expect(second).toMatchObject({
      title: '',
      series: 'The Discworld',
      description: 'My notes',
      coverImageUrl: '',
    });
  });
});

describe('editionDraftOf', () => {
  const hobbit = {
    title: 'The Hobbit',
    subtitle: 'There and Back Again',
    contributors: [
      { role: 'author' as const, author: { name: 'J. R. R. Tolkien' } },
      { role: 'illustrator' as const, author: { name: 'Alan Lee' } },
    ],
  };

  it('keeps what is about the edition', () => {
    const edition = {
      editionStatement: '2nd edition',
      publisher: 'Stock',
      published: '1969',
      language: 'fr',
      format: 'paperback' as const,
      pageCount: '320',
      coverImageUrl: 'https://covers.example/1.jpg',
    };

    expect(
      editionDraftOf(
        { ...edition, description: 'A hobbit leaves home.', series: 'Middle-earth' },
        hobbit,
      ),
    ).toEqual(edition);
  });

  it('keeps the title and subtitle that differ from the book’s', () => {
    expect(
      editionDraftOf({ title: 'Bilbo le Hobbit', subtitle: 'Aller et retour' }, hobbit),
    ).toEqual({ title: 'Bilbo le Hobbit', subtitle: 'Aller et retour' });
    expect(
      editionDraftOf({ title: 'the hobbit', subtitle: 'There and back again ' }, hobbit),
    ).toEqual({});
  });

  it('keeps the credits the book doesn’t have, but for authors', () => {
    expect(
      editionDraftOf(
        {
          contributors: [
            { name: 'Tolkien', role: 'author' },
            { name: 'alan lee', role: 'illustrator' },
            { name: 'John Howe', role: 'illustrator' },
            { name: 'Francis Ledoux', role: 'translator' },
          ],
        },
        hobbit,
      ),
    ).toEqual({
      contributors: [
        { name: 'John Howe', role: 'illustrator' },
        { name: 'Francis Ledoux', role: 'translator' },
      ],
    });
    expect(
      editionDraftOf({ contributors: [{ name: 'J. R. R. Tolkien', role: 'author' }] }, hobbit),
    ).toEqual({});
  });
});

const BOOK_ID = '0c0a6b1e-6f3e-4c1a-9b8e-2f1d7a3c5e01';

const savedBook = {
  title: 'Guards! Guards!',
  subtitle: null,
  description: 'The Night Watch meets a dragon.',
  originalLanguage: 'en',
  firstPublishedYear: 1989,
  contributors: [{ role: 'author' as const, author: { name: 'Terry Pratchett' } }],
  series: [
    { position: 1, series: { name: 'City Watch' } },
    { position: null, series: { name: 'Discworld' } },
    { position: 1.5, series: { name: 'Dragons' } },
  ],
  genres: ['fantasy' as const],
  subjects: [{ name: 'Dragons' }, { name: 'Policemen' }],
};

const savedEdition = {
  title: null,
  subtitle: null,
  editionStatement: '2nd edition',
  publisher: { name: 'Corgi' },
  publishedYear: 1990,
  publishedOn: '1990-11-01',
  isbn13: '9780552134620',
  isbn10: '0552134627',
  language: 'en',
  format: 'audiobook' as const,
  pageCount: null,
  durationMinutes: 510,
  coverImageUrl: 'https://example.org/cover.jpg',
  contributors: [{ role: 'narrator' as const, author: { name: 'Nigel Planer' } }],
};

describe('the edit forms', () => {
  it('save a book nobody changed as it was', () => {
    const edited = workFormOf(savedBook);

    expect(workFormErrors(edited)).toEqual(new Set());
    expect(updateBookSchema.parse({ bookId: BOOK_ID, ...edited })).toEqual({
      bookId: BOOK_ID,
      title: 'Guards! Guards!',
      subtitle: null,
      description: 'The Night Watch meets a dragon.',
      originalLanguage: 'en',
      firstPublishedYear: 1989,
      contributors: [{ name: 'Terry Pratchett', role: 'author' }],
      series: [
        { name: 'City Watch', position: 1 },
        { name: 'Discworld', position: null },
        { name: 'Dragons', position: 1.5 },
      ],
      genres: ['fantasy'],
      subjects: ['Dragons', 'Policemen'],
    });
  });

  it('save an edition nobody changed as it was', () => {
    const edited = editionFormOf(savedEdition);

    expect(editionFormErrors(edited)).toEqual(new Set());
    expect(updateEditionSchema.parse({ editionId: BOOK_ID, ...edited })).toEqual({
      editionId: BOOK_ID,
      title: null,
      subtitle: null,
      contributors: [{ name: 'Nigel Planer', role: 'narrator' }],
      isbn: { isbn13: '9780552134620', isbn10: '0552134627' },
      editionStatement: '2nd edition',
      publisher: 'Corgi',
      published: { publishedYear: 1990, publishedOn: '1990-11-01' },
      language: 'en',
      format: 'audiobook',
      pageCount: null,
      durationMinutes: 510,
      coverImageUrl: 'https://example.org/cover.jpg',
    });
  });

  it('save an edition with only a year, and only an ISBN-10', () => {
    const edited = editionFormOf({ ...savedEdition, publishedOn: null, isbn13: null });

    expect(updateEditionSchema.parse({ editionId: BOOK_ID, ...edited })).toMatchObject({
      isbn: { isbn13: '9780552134620', isbn10: '0552134627' },
      published: { publishedYear: 1990, publishedOn: null },
    });
  });

  it('show an empty row for a book without credits or series, and save none', () => {
    const edited = workFormOf({ ...savedBook, contributors: [], series: [] });

    expect(edited.contributors).toEqual([{ name: '', role: 'author' }]);
    expect(edited.series).toEqual([emptySeries()]);
    expect(updateBookSchema.parse({ bookId: BOOK_ID, ...edited })).toMatchObject({
      contributors: [],
      series: [],
    });
  });

  it('name the series row to correct', () => {
    const edited = workFormOf({ ...savedBook, title: ' ' });

    expect(
      workFormErrors({
        ...edited,
        series: [
          { name: '', position: '3' },
          { name: 'Discworld', position: 'eight' },
        ],
      }),
    ).toEqual(new Set(['title', 'series[0].name', 'series[1].position']));
    expect(
      workFormErrors({ ...edited, title: 'Mort', series: Array.from({ length: 11 }, emptySeries) }),
    ).toEqual(new Set(['series']));
  });
});

describe('refiledTitle', () => {
  const before = {
    title: 'The Hobbit',
    sortTitle: 'Hobbit, The',
    originalLanguage: 'en',
    editions: [{ title: null, language: 'en' }],
  };

  it('files a new title by its language', () => {
    expect(refiledTitle(before, { ...before, title: 'A Hobbit' })).toBe('Hobbit, A');
  });

  it('uses the language of the edition printed under that title', () => {
    expect(
      refiledTitle(before, {
        ...before,
        title: 'Le Hobbit',
        editions: [
          { title: 'Der Hobbit', language: 'de' },
          { title: null, language: 'fr' },
        ],
      }),
    ).toBe('Hobbit, Le');
  });

  it('files the title again when its language becomes known', () => {
    const unknown = {
      title: 'Der Hobbit',
      sortTitle: 'Der Hobbit',
      originalLanguage: null,
      editions: [],
    };

    expect(refiledTitle(unknown, { ...unknown, originalLanguage: 'de' })).toBe('Hobbit, Der');
  });

  it('keeps a title filed by hand until it changes', () => {
    const byHand = { ...before, title: '1984', sortTitle: 'Nineteen Eighty-Four' };

    expect(refiledTitle(byHand, { ...byHand, originalLanguage: 'fr' })).toBe(
      'Nineteen Eighty-Four',
    );
    expect(refiledTitle(byHand, { ...byHand, title: 'The Hobbit' })).toBe('Hobbit, The');
  });
});

/** An edition printed under the book’s own title, and one under another. */
const ownTitle = (coverImageUrl: string | null) => ({ title: null, coverImageUrl });
const otherTitle = (coverImageUrl: string | null) => ({ title: 'Bilbo le Hobbit', coverImageUrl });

describe('bookCover', () => {
  it('is that of an edition printed under the book’s own title, even after a translation’s', () => {
    expect(bookCover([otherTitle('fr.jpg'), ownTitle('en.jpg')])).toBe('en.jpg');
  });

  it('is a translation’s when no edition under the book’s own title has one', () => {
    expect(bookCover([ownTitle(null), otherTitle('fr.jpg')])).toBe('fr.jpg');
    expect(bookCover([otherTitle('fr.jpg')])).toBe('fr.jpg');
  });

  it('is the first one, of several as good', () => {
    expect(bookCover([ownTitle(null), ownTitle('1.jpg'), ownTitle('2.jpg')])).toBe('1.jpg');
    expect(bookCover([otherTitle(null), otherTitle('1.jpg'), otherTitle('2.jpg')])).toBe('1.jpg');
  });

  it('is none when no edition has one', () => {
    expect(bookCover([])).toBeNull();
    expect(bookCover([ownTitle(null), otherTitle(null)])).toBeNull();
    expect(bookCover([ownTitle('')])).toBeNull();
  });
});
