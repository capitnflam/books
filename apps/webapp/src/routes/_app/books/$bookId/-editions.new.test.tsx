import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createEditionFn, getBookFn, lookupIsbnFn } from '#/services/catalog/catalog.functions';
import { bookDetails, uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

type Page = Awaited<ReturnType<typeof renderPage>>;

const bookPath = `/books/${uuid(1)}`;
const path = `${bookPath}/editions/new`;
const isbn = '9782253049418';

const field = (page: Page, name: string) => page.getByRole('textbox', { name });

async function lookUp(page: Page, value: string) {
  await field(page, 'ISBN').fill(value);
  await page.getByRole('button', { name: 'Look up' }).click();
}

const submit = (page: Page) => page.getByRole('button', { name: 'Add to the catalogue' }).click();

beforeEach(() => {
  signIn(['catalog:manage']);
  vi.mocked(getBookFn).mockResolvedValue(bookDetails({}, { canEdit: true }));
});

describe('the form', () => {
  it('starts empty', async () => {
    const page = await renderPage(path);

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Add an edition');
    await expect
      .element(page.getByRole('link', { name: 'Back to “The Hobbit”' }))
      .toHaveAttribute('href', bookPath);
    await expect.element(field(page, 'ISBN')).toHaveValue('');
    await expect.element(field(page, 'Title of this edition')).toHaveValue('');
    await expect.element(field(page, 'Publisher')).toHaveValue('');
    await expect
      .element(page.getByRole('combobox', { name: 'Role of contributor 1' }))
      .toHaveValue('translator');
    expect(document.title).toBe('Add an edition');
  });

  it('credits people on the edition, but not as its author', async () => {
    const page = await renderPage(path);
    const roles = page.getByRole('combobox', { name: 'Role of contributor 1' });

    await expect.element(roles.getByRole('option', { name: 'Narrator' })).toBeInTheDocument();
    await expect.element(roles.getByRole('option', { name: 'Author' })).not.toBeInTheDocument();
  });
});

describe('looking up an ISBN', () => {
  it('fills in what differs from the book', async () => {
    vi.mocked(lookupIsbnFn).mockResolvedValue({
      status: 'found',
      isbn,
      draft: {
        title: 'Bilbo le Hobbit',
        subtitle: 'There and back again',
        contributors: [
          { name: 'J. R. R. Tolkien', role: 'author' },
          { name: 'Francis Ledoux', role: 'translator' },
        ],
        genres: ['fantasy'],
        publisher: 'Le Livre de Poche',
        language: 'fr',
      },
    });
    const page = await renderPage(path);

    await lookUp(page, '978-2-253-04941-8');

    await expect.element(field(page, 'Title of this edition')).toHaveValue('Bilbo le Hobbit');
    await expect.element(field(page, 'Subtitle of this edition')).toHaveValue('');
    await expect.element(field(page, 'ISBN')).toHaveValue(isbn);
    await expect.element(field(page, 'Name of contributor 1')).toHaveValue('Francis Ledoux');
    await expect.element(field(page, 'Name of contributor 2')).not.toBeInTheDocument();
    await expect.element(field(page, 'Publisher')).toHaveValue('Le Livre de Poche');
    await expect.element(page.getByRole('combobox', { name: 'Language' })).toHaveValue('fr');
  });

  it('empties what the last lookup filled, and keeps what was typed', async () => {
    vi.mocked(lookupIsbnFn)
      .mockResolvedValueOnce({
        status: 'found',
        isbn,
        draft: {
          title: 'Bilbo le Hobbit',
          contributors: [{ name: 'Francis Ledoux', role: 'translator' }],
          publisher: 'Le Livre de Poche',
        },
      })
      .mockResolvedValueOnce({ status: 'not-found', isbn: '9780140328721' });
    const page = await renderPage(path);

    await lookUp(page, isbn);
    await expect.element(field(page, 'Title of this edition')).toHaveValue('Bilbo le Hobbit');
    await field(page, 'Publisher').fill('Stock');
    await lookUp(page, '9780140328721');

    await expect.element(field(page, 'Title of this edition')).toHaveValue('');
    await expect.element(field(page, 'Name of contributor 1')).toHaveValue('');
    await expect.element(field(page, 'Publisher')).toHaveValue('Stock');
  });

  it('names the book that has the ISBN already', async () => {
    vi.mocked(lookupIsbnFn).mockResolvedValue({
      status: 'exists',
      bookId: uuid(2),
      title: 'The Silmarillion',
    });
    const page = await renderPage(path);

    await lookUp(page, isbn);

    await expect
      .element(page.getByRole('link', { name: 'View the book' }))
      .toHaveAttribute('href', `/books/${uuid(2)}`);
  });
});

describe('adding the edition', () => {
  it('sends everything filled in and goes back to the book', async () => {
    vi.mocked(createEditionFn).mockResolvedValue({ error: null });
    const page = await renderPage(path);

    await field(page, 'ISBN').fill(isbn);
    await field(page, 'Title of this edition').fill('Bilbo le Hobbit');
    await field(page, 'Name of contributor 1').fill('Francis Ledoux');
    await field(page, 'Publisher').fill('Le Livre de Poche');
    await field(page, 'Published').fill('1989');
    await page.getByRole('combobox', { name: 'Language' }).selectOptions('French');
    await page.getByRole('combobox', { name: 'Format' }).selectOptions('Paperback');
    await field(page, 'Pages').fill('480');
    await submit(page);

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('The Hobbit');
    expect(page.currentUrl()).toBe(bookPath);
    expect(createEditionFn).toHaveBeenCalledExactlyOnceWith({
      data: {
        bookId: uuid(1),
        isbn,
        title: 'Bilbo le Hobbit',
        subtitle: '',
        contributors: [{ name: 'Francis Ledoux', role: 'translator' }],
        editionStatement: '',
        publisher: 'Le Livre de Poche',
        published: '1989',
        language: 'fr',
        format: 'paperback',
        pageCount: '480',
        durationMinutes: '',
        coverImageUrl: '',
      },
    });
  });

  it('waits for fields to be corrected', async () => {
    const page = await renderPage(path);

    await field(page, 'ISBN').fill('9780261102218');
    await field(page, 'Pages').fill('0');
    await submit(page);

    await expect.element(page.getByText('Some fields need correcting.')).toBeVisible();
    await expect
      .element(page.getByText('This is not a valid ISBN: check the digits.'))
      .toBeVisible();
    await expect.element(page.getByText('Enter a whole number above zero.')).toBeVisible();
    expect(createEditionFn).not.toHaveBeenCalled();
  });

  it('names the book that has the ISBN already', async () => {
    vi.mocked(createEditionFn).mockResolvedValue({
      error: 'isbn-taken',
      bookId: uuid(2),
      title: 'The Silmarillion',
    });
    const page = await renderPage(path);

    await submit(page);

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent(
        '“The Silmarillion” already has this ISBN: it is in the catalogue. View the book',
      );
  });

  it('says so when the book was removed meanwhile', async () => {
    vi.mocked(createEditionFn).mockResolvedValue({ error: 'not-found' });
    const page = await renderPage(path);

    await submit(page);

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('This book does not exist, or it was removed from the catalogue.');
  });

  it('keeps what was typed when it fails', async () => {
    vi.mocked(createEditionFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage(path);

    await field(page, 'Pages').fill('480');
    await submit(page);

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('The edition could not be added. Try again in a moment.');
    await expect.element(field(page, 'Pages')).toHaveValue('480');
  });
});

it('says so when the book is not there', async () => {
  vi.mocked(getBookFn).mockResolvedValue(null);
  const page = await renderPage(path);

  await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Book not found');
});
