import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  applyLookup,
  bookFormErrors,
  createBookSchema,
  emptyBookForm,
  sortName,
  sortTitle,
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
        'contributors.0.name',
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
    ).toEqual(new Set(['contributors.0.name']));
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
    expect(applyLookup(emptyBookForm(), null, discworld, '9780552166591')).toMatchObject({
      ...discworld,
      isbn: '9780552166591',
    });
  });

  it('empties what the previous lookup filled when another book is looked up', () => {
    const first = applyLookup(emptyBookForm(), null, discworld, '9780552166591');
    const second = applyLookup(first, discworld, { title: 'Ficciones' }, '9780802130303');

    expect(second).toMatchObject({
      title: 'Ficciones',
      series: '',
      seriesPosition: '',
      coverImageUrl: '',
      isbn: '9780802130303',
    });
  });

  it('keeps what the reader changed or typed since', () => {
    const first = applyLookup(emptyBookForm(), null, discworld, '9780552166591');
    const edited = { ...first, series: 'The Discworld', description: 'My notes' };
    const second = applyLookup(edited, discworld, {}, '9780802130303');

    expect(second).toMatchObject({
      title: '',
      series: 'The Discworld',
      description: 'My notes',
      coverImageUrl: '',
    });
  });
});
