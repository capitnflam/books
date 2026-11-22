import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listBooksFn } from '#/services/catalog/catalog.functions';
import { listedBook, pageOf, uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

beforeEach(() => signIn());

describe('the list', () => {
  it('shows each book with its authors and year', async () => {
    vi.mocked(listBooksFn).mockResolvedValue({
      total: 2,
      books: [
        listedBook(),
        listedBook({
          id: uuid(2),
          title: 'Good Omens',
          subtitle: null,
          authors: ['Terry Pratchett', 'Neil Gaiman'],
          firstPublishedYear: null,
        }),
      ],
    });
    const page = await renderPage('/books');

    await expect.element(page.getByRole('heading', { name: 'All books (2)' })).toBeVisible();
    await expect
      .element(page.getByRole('row', { name: /The Hobbit/u }))
      .toHaveTextContent('The HobbitThere and Back AgainJ. R. R. Tolkien1937');
    await expect
      .element(page.getByRole('row', { name: /Good Omens/u }))
      .toHaveTextContent('Good OmensTerry Pratchett and Neil Gaiman');
    await expect
      .element(page.getByRole('link', { name: 'The Hobbit' }))
      .toHaveAttribute('href', `/books/${uuid(1)}`);
    expect(document.title).toBe('Catalogue');
  });

  it('shows covers, and an icon in place of one that fails to load', async () => {
    // The app's own logo: a picture that needs no network.
    const cover = new URL('/logo512.png', location.origin).href;
    const broken = new URL('/no-such-cover.png', location.origin).href;

    vi.mocked(listBooksFn).mockResolvedValue({
      total: 2,
      books: [
        listedBook({ coverImageUrl: cover }),
        listedBook({ id: uuid(2), title: 'Good Omens', coverImageUrl: broken }),
      ],
    });
    const page = await renderPage('/books');
    const row = (name: RegExp) => page.getByRole('row', { name }).element();

    await expect.element(page.getByRole('link', { name: 'Good Omens' })).toBeVisible();
    await expect.poll(() => row(/Good Omens/u).querySelector('img')).toBeNull();
    expect(row(/Good Omens/u).querySelector('svg')).not.toBeNull();
    expect(row(/The Hobbit/u).querySelector('img')).toHaveAttribute('src', cover);
  });

  it('says so when the catalogue is empty', async () => {
    vi.mocked(listBooksFn).mockResolvedValue({ total: 0, books: [] });
    const page = await renderPage('/books');

    await expect.element(page.getByText('No books yet.')).toBeVisible();
    await expect.element(page.getByRole('table')).not.toBeInTheDocument();
  });

  it('loads more books as it scrolls', async () => {
    const books = Array.from({ length: 30 }, (_, index) =>
      listedBook({ id: uuid(index), title: `Volume ${index + 1}` }),
    );

    vi.mocked(listBooksFn).mockImplementation(async ({ data }) => ({
      total: books.length,
      books: pageOf(books, data.page),
    }));
    const page = await renderPage('/books');

    await expect.element(page.getByText('25 of 30 loaded')).toBeVisible();

    page.getByRole('region', { name: 'Catalogue' }).element().scrollTo({ top: 100_000 });

    await expect.element(page.getByText('30 of 30 loaded')).toBeVisible();

    page.getByRole('region', { name: 'Catalogue' }).element().scrollTo({ top: 100_000 });

    await expect.element(page.getByRole('link', { name: 'Volume 30' })).toBeVisible();
    expect(listBooksFn).toHaveBeenLastCalledWith({ data: { q: undefined, page: 2 } });
  });
});

describe('searching', () => {
  it('finds books and keeps the search in the URL', async () => {
    vi.mocked(listBooksFn).mockResolvedValue({ total: 0, books: [] });
    const page = await renderPage('/books');

    await expect.element(page.getByRole('heading', { name: 'All books (0)' })).toBeVisible();
    vi.mocked(listBooksFn).mockResolvedValue({ total: 1, books: [listedBook()] });

    await page
      .getByRole('searchbox', { name: 'Search by title, author, series or ISBN' })
      .fill('  hobbit ');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect
      .element(page.getByRole('heading', { name: 'Books matching “hobbit” (1)' }))
      .toBeVisible();
    expect(page.currentUrl()).toBe('/books?q=hobbit');
    expect(listBooksFn).toHaveBeenLastCalledWith({ data: { q: 'hobbit', page: 1 } });
  });

  it('reads the search from the URL, an ISBN included', async () => {
    vi.mocked(listBooksFn).mockResolvedValue({ total: 1, books: [listedBook()] });
    const page = await renderPage('/books?q=9780261102217');

    await expect
      .element(page.getByRole('searchbox', { name: 'Search by title, author, series or ISBN' }))
      .toHaveValue('9780261102217');
    expect(listBooksFn).toHaveBeenCalledWith({ data: { q: '9780261102217', page: 1 } });
  });

  it('says so when no book matches', async () => {
    vi.mocked(listBooksFn).mockResolvedValue({ total: 0, books: [] });
    const page = await renderPage('/books?q=xyz');

    await expect.element(page.getByText('No book matches “xyz”.')).toBeVisible();
  });

  it('shows every book again once emptied', async () => {
    vi.mocked(listBooksFn).mockResolvedValue({ total: 1, books: [listedBook()] });
    const page = await renderPage('/books?q=hobbit');

    await page.getByRole('searchbox').fill('');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect.element(page.getByRole('heading', { name: 'All books (1)' })).toBeVisible();
    expect(page.currentUrl()).toBe('/books');
  });
});

describe('adding a book', () => {
  beforeEach(() => {
    vi.mocked(listBooksFn).mockResolvedValue({ total: 1, books: [listedBook()] });
  });

  it('is offered to those who may', async () => {
    signIn(['catalog:manage']);
    const page = await renderPage('/books');

    await expect
      .element(page.getByRole('main').getByText('Add a book'))
      .toHaveAttribute('href', '/books/new');
  });

  it('is not offered to other readers', async () => {
    const page = await renderPage('/books');

    await expect.element(page.getByRole('link', { name: 'The Hobbit' })).toBeVisible();
    await expect.element(page.getByRole('main').getByText('Add a book')).not.toBeInTheDocument();
  });
});
