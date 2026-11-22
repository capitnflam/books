import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fromGoogleBooks } from './isbn-google-books.server';
import { SourceUnavailableError } from './isbn-source.server';

const hobbit = { isbn13: '9780261102217', isbn10: '0261102214' };

const fetchMock = vi.fn<(input: string) => Promise<Response>>();

const respond = (answer: unknown) =>
  fetchMock.mockImplementation(async () => Response.json(answer));

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('fromGoogleBooks', () => {
  it('fills the form from the first volume', async () => {
    respond({
      items: [
        {
          volumeInfo: {
            title: 'The Hobbit',
            subtitle: 'or There and Back Again',
            authors: ['J.R.R.  Tolkien'],
            publisher: 'HarperCollins',
            publishedDate: '2009-04-30',
            description: '<p>Bilbo goes <b>there</b>.</p>',
            pageCount: 310,
            categories: ['Fiction / Fantasy / Epic'],
            language: 'en',
            imageLinks: { thumbnail: 'http://books.google.com/cover?id=1&edge=curl' },
          },
        },
        { volumeInfo: { title: 'Another book' } },
      ],
    });

    await expect(fromGoogleBooks(hobbit, 'test-key')).resolves.toEqual({
      title: 'The Hobbit',
      subtitle: 'or There and Back Again',
      contributors: [{ name: 'J.R.R. Tolkien', role: 'author' }],
      description: 'Bilbo goes there.',
      genres: ['fantasy'],
      subjects: 'Fiction, Fantasy, Epic',
      publisher: 'HarperCollins',
      published: '2009-04-30',
      language: 'en',
      pageCount: '310',
      coverImageUrl: 'https://books.google.com/cover?id=1',
    });

    const url = new URL(fetchMock.mock.calls[0]![0]);

    expect(url.searchParams.get('q')).toBe('isbn:9780261102217');
    expect(url.searchParams.get('key')).toBe('test-key');
  });

  it('drops a language that is not a language tag', async () => {
    respond({ items: [{ volumeInfo: { title: 'The Hobbit', language: 'English' } }] });

    await expect(fromGoogleBooks(hobbit, 'test-key')).resolves.toEqual({ title: 'The Hobbit' });
  });

  it('drops a page count of 0 and keeps the rest', async () => {
    respond({ items: [{ volumeInfo: { title: 'The Hobbit', pageCount: 0 } }] });

    await expect(fromGoogleBooks(hobbit, 'test-key')).resolves.toEqual({ title: 'The Hobbit' });
  });

  it('keeps the first volume when another one has a page count of 0', async () => {
    respond({
      items: [
        { volumeInfo: { title: 'The Hobbit', pageCount: 310 } },
        { volumeInfo: { title: 'Another book', pageCount: 0 } },
      ],
    });

    await expect(fromGoogleBooks(hobbit, 'test-key')).resolves.toEqual({
      title: 'The Hobbit',
      pageCount: '310',
    });
  });

  it('finds nothing in an empty answer', async () => {
    respond({ totalItems: 0 });

    await expect(fromGoogleBooks(hobbit, 'test-key')).resolves.toBeNull();
  });

  it('counts a refused request as unavailable', async () => {
    fetchMock.mockImplementation(async () => new Response('Quota exceeded', { status: 429 }));

    await expect(fromGoogleBooks(hobbit, 'test-key')).rejects.toThrow(SourceUnavailableError);
  });
});
