import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatFromText, lookupIsbnOnline, seriesFromText } from './isbn-lookup.server';
import { languageFromMarc, publishedFromText } from './isbn-source.server';

const hobbit = { isbn13: '9780261102217', isbn10: '0261102214' };

/** Answers for each URL the lookup may fetch, by the start of its path; anything else is a 404. */
let responses: Record<string, unknown | Error>;

const fetchMock = vi.fn(async (input: string) => {
  const url = new URL(input);
  const key = Object.keys(responses).find((prefix) =>
    `${url.host}${url.pathname}`.startsWith(prefix),
  );
  const answer = key === undefined ? undefined : responses[key];

  if (answer instanceof Error) {
    throw answer;
  }

  return answer === undefined ? new Response('Not found', { status: 404 }) : Response.json(answer);
});

const openLibraryHobbit = {
  'openlibrary.org/isbn/9780261102217.json': {
    title: 'The Hobbit',
    subtitle: 'or There and Back Again',
    publishers: ['HarperCollins'],
    publish_date: '2009',
    physical_format: 'paperback',
    number_of_pages: 310,
    languages: [{ key: '/languages/eng' }],
    covers: [-1, 12_649_317],
    works: [{ key: '/works/OL27482W' }],
    contributors: [
      { name: 'Douglas A. Anderson', role: 'Foreword' },
      { name: 'Someone', role: 'Cover design' },
    ],
  },
  'openlibrary.org/works/OL27482W.json': {
    description: {
      type: '/type/text',
      value:
        'A *tale* of [high adventure](https://example.org).\r\n\r\n----------\nAlso contained in: …',
    },
    subjects: ['Fantasy fiction', 'nyt:children', 'Dragons', 'fantasy fiction', 'Fiction, general'],
    authors: [{ author: { key: '/authors/OL26320A' } }],
  },
  'openlibrary.org/search.json': {
    docs: [{ author_name: [' J.R.R.  Tolkien '], first_publish_year: 1937 }],
  },
};

beforeEach(() => {
  responses = {};
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockClear();
});

describe('lookupIsbnOnline', () => {
  it('fills the form from Open Library’s edition, work and search records', async () => {
    responses = openLibraryHobbit;

    await expect(lookupIsbnOnline(hobbit)).resolves.toEqual({
      status: 'found',
      draft: {
        title: 'The Hobbit',
        subtitle: 'or There and Back Again',
        contributors: [
          { name: 'J.R.R. Tolkien', role: 'author' },
          { name: 'Douglas A. Anderson', role: 'introduction' },
        ],
        description: 'A tale of high adventure.',
        firstPublishedYear: '1937',
        genres: ['fantasy', 'children'],
        subjects: 'Fantasy fiction, Dragons',
        publisher: 'HarperCollins',
        published: '2009',
        language: 'en',
        format: 'paperback',
        pageCount: '310',
        coverImageUrl: 'https://covers.openlibrary.org/b/id/12649317-L.jpg',
      },
    });
  });

  it('keeps no more credits than the form takes', async () => {
    const edition = openLibraryHobbit['openlibrary.org/isbn/9780261102217.json'];

    responses = {
      ...openLibraryHobbit,
      'openlibrary.org/isbn/9780261102217.json': {
        ...edition,
        contributors: Array.from({ length: 30 }, (_, index) => ({
          name: `Translator ${index}`,
          role: 'Translator',
        })),
      },
    };

    const outcome = await lookupIsbnOnline(hobbit);

    expect(outcome).toMatchObject({ status: 'found' });
    expect(outcome).toHaveProperty('draft.contributors.length', 20);
  });

  it('asks for the authors’ records when the search has no names', async () => {
    responses = {
      ...openLibraryHobbit,
      'openlibrary.org/search.json': { docs: [] },
      'openlibrary.org/authors/OL26320A.json': { name: 'J. R. R. Tolkien' },
    };

    const outcome = await lookupIsbnOnline(hobbit);

    expect(outcome).toMatchObject({
      draft: {
        contributors: [
          { name: 'J. R. R. Tolkien', role: 'author' },
          { name: 'Douglas A. Anderson', role: 'introduction' },
        ],
      },
    });
  });

  it('keeps what the edition has when the work cannot be fetched', async () => {
    responses = {
      ...openLibraryHobbit,
      'openlibrary.org/works/OL27482W.json': new TypeError('fetch failed'),
    };

    const outcome = await lookupIsbnOnline(hobbit);

    expect(outcome).toMatchObject({ status: 'found', draft: { title: 'The Hobbit' } });
    expect(outcome).not.toHaveProperty('draft.description');
  });

  it('fills the gaps from Google Books when it has a key', async () => {
    responses = {
      ...openLibraryHobbit,
      'openlibrary.org/works/OL27482W.json': {},
      'www.googleapis.com/books/v1/volumes': {
        items: [
          {
            volumeInfo: {
              title: 'The Hobbit (Google)',
              description: '<p>Bilbo goes <b>there</b>.</p>',
              categories: ['Fiction / Fantasy / Epic'],
              imageLinks: { thumbnail: 'http://books.google.com/cover?id=1&edge=curl' },
            },
          },
        ],
      },
    };

    const outcome = await lookupIsbnOnline(hobbit, { googleBooksApiKey: 'test-key' });

    expect(outcome).toMatchObject({
      status: 'found',
      draft: {
        // Open Library comes first…
        title: 'The Hobbit',
        coverImageUrl: 'https://covers.openlibrary.org/b/id/12649317-L.jpg',
        // …and Google Books fills what it lacks.
        description: 'Bilbo goes there.',
        genres: ['fantasy'],
        subjects: 'Fiction, Fantasy, Epic',
      },
    });
    expect(fetchMock.mock.calls.find(([url]) => url.includes('googleapis'))?.[0]).toContain(
      'key=test-key',
    );
  });

  it('does not ask Google Books without a key', async () => {
    await lookupIsbnOnline(hobbit);

    expect(fetchMock.mock.calls.map(([url]) => new URL(url).host)).toEqual(['openlibrary.org']);
  });

  it('reports an ISBN no source knows', async () => {
    await expect(lookupIsbnOnline(hobbit)).resolves.toEqual({ status: 'not-found' });
  });

  it('reports sources that cannot be reached', async () => {
    responses = { 'openlibrary.org/': new TypeError('fetch failed') };

    await expect(lookupIsbnOnline(hobbit)).resolves.toEqual({ status: 'unavailable' });
  });
});

describe('publishedFromText', () => {
  it('keeps the full date when the day is known, else the year', () => {
    expect(publishedFromText('1991-09-21')).toBe('1991-09-21');
    expect(publishedFromText('Sep 21, 1991')).toBe('1991-09-21');
    expect(publishedFromText('21 September 1991')).toBe('1991-09-21');
    expect(publishedFromText('September 1991')).toBe('1991');
    expect(publishedFromText('1991-09')).toBe('1991');
    expect(publishedFromText('c1991')).toBe('1991');
    expect(publishedFromText('unknown')).toBeUndefined();
    expect(publishedFromText(undefined)).toBeUndefined();
  });
});

describe('formatFromText', () => {
  it('maps the formats sources write to edition formats', () => {
    expect(formatFromText('Mass Market Paperback')).toBe('mass_market_paperback');
    expect(formatFromText('paperback')).toBe('paperback');
    expect(formatFromText('Hardback')).toBe('hardcover');
    expect(formatFromText('Kindle Edition')).toBe('ebook');
    expect(formatFromText('Audio CD')).toBe('audiobook');
    expect(formatFromText('Spiral-bound')).toBe('other');
    expect(formatFromText(undefined)).toBeUndefined();
  });
});

describe('languageFromMarc', () => {
  it('maps MARC codes to BCP 47 tags', () => {
    expect(languageFromMarc('/languages/fre')).toBe('fr');
    expect(languageFromMarc('/languages/xyz')).toBeUndefined();
  });
});

describe('seriesFromText', () => {
  it('splits a series into its name and the book’s number', () => {
    expect(seriesFromText('Discworld -- 1')).toEqual({ series: 'Discworld', seriesPosition: '1' });
    expect(seriesFromText('Discworld ; 2')).toEqual({ series: 'Discworld', seriesPosition: '2' });
    expect(seriesFromText('Harry Potter (Book 3)')).toEqual({
      series: 'Harry Potter',
      seriesPosition: '3',
    });
    expect(seriesFromText('Discworld #4.5')).toEqual({
      series: 'Discworld',
      seriesPosition: '4.5',
    });
    // Open Library's own wording for Dune.
    expect(seriesFromText('Dune chronicles -- bk. 1')).toEqual({
      series: 'Dune chronicles',
      seriesPosition: '1',
    });
    // Names ending in a keyword's letters keep them: the keyword must be a word of its own.
    expect(seriesFromText('Domino 3')).toEqual({ series: 'Domino', seriesPosition: '3' });
    expect(seriesFromText('Casino 2')).toEqual({ series: 'Casino', seriesPosition: '2' });
    expect(seriesFromText('Lorebook 1')).toEqual({ series: 'Lorebook', seriesPosition: '1' });
    expect(seriesFromText('Penguin Classics')).toEqual({
      series: 'Penguin Classics',
      seriesPosition: '',
    });
  });
});
