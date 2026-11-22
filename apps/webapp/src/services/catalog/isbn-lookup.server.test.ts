import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fromBnf } from './isbn-bnf.server';
import { fromGoogleBooks } from './isbn-google-books.server';
import { lookupIsbnOnline, mergeDrafts } from './isbn-lookup.server';
import { fromNdl } from './isbn-ndl.server';
import { fromOpenLibrary } from './isbn-open-library.server';

vi.mock('./isbn-bnf.server');
vi.mock('./isbn-google-books.server');
vi.mock('./isbn-ndl.server');
vi.mock('./isbn-open-library.server');

const bnf = vi.mocked(fromBnf);
const googleBooks = vi.mocked(fromGoogleBooks);
const ndl = vi.mocked(fromNdl);
const openLibrary = vi.mocked(fromOpenLibrary);

const english = { isbn13: '9780261102217', isbn10: '0261102214' };
const french = { isbn13: '9782871294146', isbn10: '2871294143' };
const japanese = { isbn13: '9784088725093', isbn10: '4088725093' };

const down = new Error('The source is down');

// No source knows the book, until a test says otherwise.
beforeEach(() => {
  for (const source of [bnf, googleBooks, ndl, openLibrary]) {
    source.mockReset().mockResolvedValue(null);
  }
});

describe('lookupIsbnOnline', () => {
  it('asks only Open Library for most ISBNs', async () => {
    await lookupIsbnOnline(english);

    expect(openLibrary).toHaveBeenCalledWith(english);
    expect(bnf).not.toHaveBeenCalled();
    expect(ndl).not.toHaveBeenCalled();
    expect(googleBooks).not.toHaveBeenCalled();
  });

  it('also asks Google Books when it has a key', async () => {
    await lookupIsbnOnline(english, { googleBooksApiKey: 'test-key' });

    expect(googleBooks).toHaveBeenCalledWith(english, 'test-key');
  });

  it.each(['9782871294146', '9791032710838'])('also asks the BnF for %s', async (isbn13) => {
    await lookupIsbnOnline({ isbn13, isbn10: null });

    expect(bnf).toHaveBeenCalledOnce();
    expect(ndl).not.toHaveBeenCalled();
    expect(openLibrary).toHaveBeenCalledOnce();
  });

  it('also asks NDL Search for a Japanese ISBN', async () => {
    await lookupIsbnOnline(japanese);

    expect(ndl).toHaveBeenCalledWith(japanese);
    expect(bnf).not.toHaveBeenCalled();
    expect(openLibrary).toHaveBeenCalledOnce();
  });

  it('prefers Open Library to Google Books', async () => {
    openLibrary.mockResolvedValue({ title: 'The Hobbit' });
    googleBooks.mockResolvedValue({ title: 'The Hobbit (Google)', pageCount: '310' });

    await expect(lookupIsbnOnline(english, { googleBooksApiKey: 'test-key' })).resolves.toEqual({
      status: 'found',
      draft: { title: 'The Hobbit', pageCount: '310' },
    });
  });

  it.each([
    ['the BnF', bnf, french],
    ['NDL Search', ndl, japanese],
  ])('prefers %s to Open Library', async (_, library, isbns) => {
    library.mockResolvedValue({ title: 'Naruto, tome 1' });
    openLibrary.mockResolvedValue({ title: 'Naruto', pageCount: '187' });

    await expect(lookupIsbnOnline(isbns)).resolves.toEqual({
      status: 'found',
      draft: { title: 'Naruto, tome 1', pageCount: '187' },
    });
  });

  it('uses the other sources when one is down', async () => {
    bnf.mockRejectedValue(down);
    openLibrary.mockResolvedValue({ title: 'Naruto' });

    await expect(lookupIsbnOnline(french)).resolves.toEqual({
      status: 'found',
      draft: { title: 'Naruto' },
    });
  });

  it('reports an ISBN no source knows', async () => {
    await expect(lookupIsbnOnline(english)).resolves.toEqual({ status: 'not-found' });
  });

  it('reports an ISBN as unknown when only a lesser source is down', async () => {
    openLibrary.mockRejectedValue(down);

    await expect(lookupIsbnOnline(french)).resolves.toEqual({ status: 'not-found' });
  });

  it.each([
    ['Open Library', openLibrary, english],
    ['the BnF', bnf, french],
    ['NDL Search', ndl, japanese],
  ])('does not call an ISBN unknown when %s is down', async (_, source, isbns) => {
    source.mockRejectedValue(down);

    await expect(lookupIsbnOnline(isbns)).resolves.toEqual({ status: 'unavailable' });
  });
});

describe('mergeDrafts', () => {
  it('lets the first source win each field', () => {
    expect(
      mergeDrafts([
        { title: 'Celui qui part', pageCount: '64' },
        { title: 'Les vieux fourneaux - tome 3', publisher: 'Dargaud' },
      ]),
    ).toEqual({ title: 'Celui qui part', pageCount: '64', publisher: 'Dargaud' });
  });

  it('takes a subtitle or a position only with the title or series it belongs to', () => {
    expect(
      mergeDrafts([
        { title: 'Romance dawn', series: 'One piece' },
        { title: 'One Piece', subtitle: 'Tome 1', series: 'Shonen', seriesPosition: '12' },
        { title: 'Romance Dawn', subtitle: 'À l’aube', series: 'One Piece', seriesPosition: '1' },
      ]),
    ).toEqual({
      title: 'Romance dawn',
      subtitle: 'À l’aube',
      series: 'One piece',
      seriesPosition: '1',
    });
  });
});
