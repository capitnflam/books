import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBookFn } from '#/services/catalog/catalog.functions';
import { bookDetails, credit, edition, uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

import type { BookDetails } from '#/services/catalog/book-details';

const path = `/books/${uuid(1)}`;

/** The facts listed in a part of the page, as "label: value". */
const factsIn = (part: Element) =>
  [...part.querySelectorAll('dt')].map(
    (term) => `${term.textContent}: ${term.nextElementSibling?.textContent}`,
  );

/** Opens the book's page, to read the book's facts and those of each edition. */
async function renderBook(details: BookDetails) {
  vi.mocked(getBookFn).mockResolvedValue(details);
  const page = await renderPage(path);

  await expect
    .element(page.getByRole('heading', { level: 1 }))
    .toHaveTextContent(details.book.title);

  return {
    ...page,
    facts: () => factsIn(page.getByRole('region', { name: 'About this book' }).element()),
    editionFacts: () =>
      page
        .getByRole('region', { name: /^Editions/u })
        .getByRole('listitem')
        .elements()
        .map((element) => factsIn(element)),
  };
}

/** Opens the book's page, to read the cover of the work, above those of the editions. */
async function renderCover(editions: BookDetails['book']['editions']) {
  const page = await renderBook(bookDetails({ editions }));
  const title = page.getByRole('heading', { level: 1 }).element();

  return title.closest('header')?.querySelector('img');
}

beforeEach(() => signIn());

describe('the work', () => {
  it('shows everything known about it', async () => {
    const page = await renderBook(
      bookDetails({
        contributors: [
          credit('Terry Pratchett'),
          credit('Neil Gaiman', 'author', 1),
          credit('Paul Kidby', 'illustrator', 2),
        ],
      }),
    );

    await expect.element(page.getByText('There and Back Again')).toBeVisible();
    await expect.element(page.getByText('by Terry Pratchett and Neil Gaiman')).toBeVisible();
    await expect.element(page.getByRole('list', { name: 'Genres' })).toHaveTextContent('Fantasy');
    await expect.element(page.getByText('A hobbit leaves home.')).toBeVisible();
    expect(page.facts()).toEqual([
      'First published: 1937',
      'Original language: English',
      'Illustrator: Paul Kidby',
      'Series: Middle-earth, number 1',
      'Subjects: Dragons',
    ]);
    expect(document.title).toBe('The Hobbit');
  });

  it('leaves out what is not known', async () => {
    const page = await renderBook(
      bookDetails({
        subtitle: null,
        description: null,
        originalLanguage: null,
        firstPublishedYear: null,
        contributors: [],
        series: [],
        subjects: [],
        genres: [],
        editions: [],
      }),
    );

    expect(page.facts()).toEqual([]);
    await expect.element(page.getByText(/^by /u)).not.toBeInTheDocument();
    await expect.element(page.getByRole('list', { name: 'Genres' })).not.toBeInTheDocument();
    await expect.element(page.getByText('No edition of this book is recorded.')).toBeVisible();
  });

  it('dates a book from before the common era', async () => {
    const page = await renderBook(bookDetails({ firstPublishedYear: -800 }));

    expect(page.facts()).toContain('First published: 800 BC');
  });

  it('names a series the book has no number in', async () => {
    const [series] = bookDetails().book.series;
    const page = await renderBook(bookDetails({ series: [{ ...series!, position: null }] }));

    expect(page.facts()).toContain('Series: Middle-earth');
  });

  it('leads back to the catalogue', async () => {
    const page = await renderBook(bookDetails());

    await expect
      .element(page.getByRole('link', { name: 'The whole catalogue' }))
      .toHaveAttribute('href', '/books');
  });
});

describe('the cover', () => {
  // The app's own logos: pictures that need no network.
  const originalCover = new URL('/logo512.png', location.origin).href;
  const translationCover = new URL('/logo192.png', location.origin).href;
  const translation = edition({
    id: uuid(11),
    title: 'Bilbo le Hobbit',
    coverImageUrl: translationCover,
  });

  it('is that of an edition under the book’s own title, though a translation came first', async () => {
    const cover = await renderCover([translation, edition({ coverImageUrl: originalCover })]);

    expect(cover).toHaveAttribute('src', originalCover);
    expect(cover).toHaveAttribute('alt', 'Cover of The Hobbit');
  });

  it('is a translation’s when no edition under the book’s own title has one', async () => {
    const cover = await renderCover([edition(), translation]);

    expect(cover).toHaveAttribute('src', translationCover);
  });

  it('is left out when no edition has one', async () => {
    expect(await renderCover([edition()])).toBeNull();
  });
});

describe('the editions', () => {
  it('show everything known about them', async () => {
    const page = await renderBook(
      bookDetails({
        editions: [
          edition(),
          edition({
            id: uuid(11),
            title: 'Le Hobbit',
            subtitle: 'Histoire d’un aller et retour',
            editionStatement: null,
            publisher: null,
            publishedOn: null,
            publishedYear: 1969,
            isbn10: null,
            isbn13: null,
            language: 'fr',
            format: 'audiobook',
            pageCount: null,
            durationMinutes: 680,
            contributors: [credit('Francis Ledoux', 'translator')],
          }),
        ],
      }),
    );

    await expect.element(page.getByRole('heading', { name: 'Editions (2)' })).toBeVisible();
    await expect.element(page.getByRole('heading', { name: 'Le Hobbit' })).toBeVisible();
    await expect.element(page.getByText('Histoire d’un aller et retour')).toBeVisible();
    expect(page.editionFacts()).toEqual([
      [
        'Edition: 2nd edition',
        'Publisher: Allen & Unwin',
        'Published: July 19, 1951',
        'Format: Hardcover',
        'Pages: 310',
        'Language: English',
        'ISBN: 9780261102217 · 0261102214',
      ],
      [
        'Published: 1969',
        'Format: Audiobook',
        'Running time, in minutes: 680',
        'Language: French',
        'Translator: Francis Ledoux',
      ],
    ]);
  });

  it('go by the book’s title when they have none of their own', async () => {
    const page = await renderBook(bookDetails({ editions: [edition({ title: null })] }));

    await expect.element(page.getByRole('heading', { level: 3, name: 'The Hobbit' })).toBeVisible();
  });
});

describe('adding an edition', () => {
  it.each([
    ['another', [edition()]],
    ['the first', []],
  ])('is offered to those who may, be it %s', async (_, editions) => {
    const page = await renderBook(bookDetails({ editions }, { canEdit: true }));

    await expect
      .element(page.getByRole('link', { name: 'Add an edition' }))
      .toHaveAttribute('href', `${path}/editions/new`);
  });

  it('is not offered to other readers', async () => {
    const page = await renderBook(bookDetails());

    await expect
      .element(page.getByRole('link', { name: 'Add an edition' }))
      .not.toBeInTheDocument();
  });
});

describe('editing', () => {
  it('is offered to those who may', async () => {
    const page = await renderBook(bookDetails({}, { canEdit: true }));

    await expect.element(page.getByText('Edit this book')).toHaveAttribute('href', `${path}/edit`);
    await expect
      .element(page.getByText('Edit this edition'))
      .toHaveAttribute('href', `${path}/editions/${uuid(10)}/edit`);
  });

  it('is not offered to other readers', async () => {
    const page = await renderBook(bookDetails());

    await expect.element(page.getByText('Edit this book')).not.toBeInTheDocument();
    await expect.element(page.getByText('Edit this edition')).not.toBeInTheDocument();
  });
});

describe('a book that is not there', () => {
  it('is not found', async () => {
    vi.mocked(getBookFn).mockResolvedValue(null);
    const page = await renderPage(path);

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Book not found');
    await expect
      .element(page.getByRole('link', { name: 'The whole catalogue' }))
      .toHaveAttribute('href', '/books');
  });

  it('is not looked for when its id can’t be one', async () => {
    const page = await renderPage('/books/the-hobbit');

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Book not found');
    expect(getBookFn).not.toHaveBeenCalled();
  });
});
