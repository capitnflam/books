import { describe, expect, it } from 'vitest';

import { bookFormErrors, createBookSchema, emptyBookForm, sortName, sortTitle } from './catalog';

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
