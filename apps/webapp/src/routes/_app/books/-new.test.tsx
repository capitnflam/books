import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page as browser } from 'vitest/browser';

import { createBookFn, lookupIsbnFn } from '#/services/catalog/catalog.functions';
import { uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

type Page = Awaited<ReturnType<typeof renderPage>>;
type LookupResult = Awaited<ReturnType<typeof lookupIsbnFn>>;

const isbn = '9780261102217';

const field = (page: Page, name: string) => page.getByRole('textbox', { name });

async function lookUp(page: Page, value: string) {
  await field(page, 'ISBN').fill(value);
  await page.getByRole('button', { name: 'Look up' }).click();
}

/** The fields no book goes without. */
async function fillRequired(page: Page, title = 'The Hobbit') {
  await field(page, 'Title').fill(title);
  await page.getByRole('combobox', { name: 'Genres' }).fill('mistery');
  await browser.getByRole('option', { name: 'Mystery' }).click();
}

const submit = (page: Page) => page.getByRole('button', { name: 'Add to the catalogue' }).click();

beforeEach(() => signIn(['catalog:manage']));

describe('looking up an ISBN', () => {
  it('fills in what the catalogues know', async () => {
    vi.mocked(lookupIsbnFn).mockResolvedValue({
      status: 'found',
      isbn,
      draft: {
        title: 'The Hobbit',
        contributors: [
          { name: 'J. R. R. Tolkien', role: 'author' },
          { name: 'Alan Lee', role: 'illustrator' },
        ],
        publisher: 'HarperCollins',
        format: 'paperback',
      },
    });
    const page = await renderPage('/books/new');

    await lookUp(page, '978-0-261-10221-7');

    await expect
      .element(
        page.getByText(
          'Details found and filled in. Check them, and add anything missing, before adding the book.',
        ),
      )
      .toBeVisible();
    expect(lookupIsbnFn).toHaveBeenCalledExactlyOnceWith({ data: { isbn: '978-0-261-10221-7' } });
    await expect.element(field(page, 'ISBN')).toHaveValue(isbn);
    await expect.element(field(page, 'Title')).toHaveValue('The Hobbit');
    await expect.element(field(page, 'Name of contributor 2')).toHaveValue('Alan Lee');
    await expect.element(field(page, 'Publisher')).toHaveValue('HarperCollins');
    await expect.element(page.getByRole('combobox', { name: 'Format' })).toHaveValue('paperback');
  });

  it('empties what the last lookup filled, and keeps what was typed', async () => {
    vi.mocked(lookupIsbnFn)
      .mockResolvedValueOnce({
        status: 'found',
        isbn,
        draft: { title: 'The Hobbit', publisher: 'HarperCollins' },
      })
      .mockResolvedValueOnce({ status: 'not-found', isbn: '9780140328721' });
    const page = await renderPage('/books/new');

    await lookUp(page, isbn);
    await expect.element(field(page, 'Title')).toHaveValue('The Hobbit');
    await field(page, 'Publisher').fill('Allen & Unwin');
    await lookUp(page, '9780140328721');

    await expect
      .element(page.getByText('No book catalogue knows this ISBN. Fill in the details yourself.'))
      .toBeVisible();
    await expect.element(field(page, 'Title')).toHaveValue('');
    await expect.element(field(page, 'Publisher')).toHaveValue('Allen & Unwin');
  });

  it('names the book that has the ISBN already', async () => {
    vi.mocked(lookupIsbnFn).mockResolvedValue({
      status: 'exists',
      bookId: uuid(1),
      title: 'The Hobbit',
    });
    const page = await renderPage('/books/new');

    await lookUp(page, isbn);

    await expect
      .element(
        page.getByText('“The Hobbit” is already in the catalogue with this ISBN.', {
          exact: false,
        }),
      )
      .toBeVisible();
    await expect
      .element(page.getByRole('link', { name: 'View the book' }))
      .toHaveAttribute('href', `/books/${uuid(1)}`);
  });

  it('does not look up an empty ISBN', async () => {
    const page = await renderPage('/books/new');

    await page.getByRole('button', { name: 'Look up' }).click();

    await expect
      .element(page.getByText('This is not a valid ISBN: check the digits.'))
      .toBeVisible();
    await expect.element(field(page, 'ISBN')).toHaveAttribute('aria-invalid', 'true');
    expect(lookupIsbnFn).not.toHaveBeenCalled();
  });

  it.each<[LookupResult, string]>([
    [{ status: 'invalid' }, 'This is not a valid ISBN: check the digits.'],
    [
      { status: 'unavailable', isbn },
      'The book catalogues can’t be reached right now. Try again later, or fill in the details yourself.',
    ],
  ])('explains the answer %o', async (result, message) => {
    vi.mocked(lookupIsbnFn).mockResolvedValue(result);
    const page = await renderPage('/books/new');

    await lookUp(page, isbn);

    await expect.element(page.getByText(message)).toBeVisible();
  });

  it('says so when it fails, until the ISBN changes', async () => {
    vi.mocked(lookupIsbnFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage('/books/new');
    const message = page.getByText('The ISBN could not be looked up. Try again in a moment.');

    await lookUp(page, isbn);
    await expect.element(message).toBeVisible();

    await field(page, 'ISBN').fill('978');
    await expect.element(message).not.toBeInTheDocument();
  });

  it('ignores an answer for an ISBN corrected since', async () => {
    let corrected = false;

    vi.mocked(lookupIsbnFn).mockImplementation(async () => {
      await vi.waitUntil(() => corrected, { timeout: 10_000 });

      return { status: 'found', isbn, draft: { title: 'The Hobbit' } };
    });
    const page = await renderPage('/books/new');

    await lookUp(page, isbn);
    await expect.element(page.getByText('Looking up the ISBN…')).toBeVisible();
    await field(page, 'ISBN').fill('9780140328721');
    corrected = true;
    await expect.poll(() => lookupIsbnFn).toHaveResolved();

    await expect.element(page.getByRole('button', { name: 'Look up' })).toBeEnabled();
    await expect.element(field(page, 'ISBN')).toHaveValue('9780140328721');
    await expect.element(field(page, 'Title')).toHaveValue('');
  });
});

describe('adding the book', () => {
  it('sends everything filled in', async () => {
    vi.mocked(createBookFn).mockResolvedValue({
      error: null,
      bookId: uuid(1),
      title: 'The Hobbit',
    });
    const page = await renderPage('/books/new');

    await field(page, 'ISBN').fill(isbn);
    await fillRequired(page);
    await field(page, 'Name of contributor 1').fill('J. R. R. Tolkien');
    await field(page, 'Series').fill('Middle-earth');
    await field(page, 'Number in the series').fill('1');
    await page.getByRole('combobox', { name: 'Language' }).selectOptions('English');
    await field(page, 'Published').fill('1937-09-21');
    await submit(page);

    await expect
      .element(page.getByRole('heading', { name: '“The Hobbit” is now in the catalogue.' }))
      .toHaveFocus();
    expect(createBookFn).toHaveBeenCalledExactlyOnceWith({
      data: {
        isbn,
        title: 'The Hobbit',
        subtitle: '',
        contributors: [{ name: 'J. R. R. Tolkien', role: 'author' }],
        description: '',
        originalLanguage: '',
        firstPublishedYear: '',
        series: 'Middle-earth',
        seriesPosition: '1',
        genres: ['mystery'],
        subjects: '',
        editionStatement: '',
        publisher: '',
        published: '1937-09-21',
        language: 'en',
        format: '',
        pageCount: '',
        durationMinutes: '',
        coverImageUrl: '',
      },
    });
    await expect
      .element(page.getByText('View the book'))
      .toHaveAttribute('href', `/books/${uuid(1)}`);
  });

  it('starts another book from an empty form', async () => {
    vi.mocked(createBookFn).mockResolvedValue({
      error: null,
      bookId: uuid(1),
      title: 'The Hobbit',
    });
    const page = await renderPage('/books/new');

    await fillRequired(page);
    await submit(page);
    await page.getByRole('button', { name: 'Add another book' }).click();

    await expect.element(field(page, 'Title')).toHaveValue('');
    await expect
      .element(page.getByRole('button', { name: 'Remove Mystery' }))
      .not.toBeInTheDocument();
  });

  it('waits for the required fields', async () => {
    const page = await renderPage('/books/new');

    await submit(page);

    await expect.element(page.getByText('Some fields need correcting.')).toBeVisible();
    await expect.element(page.getByText('Enter the title, in up to 500 characters.')).toBeVisible();
    await expect.element(page.getByText('Choose at least one genre.')).toBeVisible();
    expect(createBookFn).not.toHaveBeenCalled();
  });

  it('waits for the ISBN to be corrected', async () => {
    const page = await renderPage('/books/new');

    await field(page, 'ISBN').fill('9780261102218');
    await fillRequired(page);
    await submit(page);

    await expect
      .element(page.getByText('This is not a valid ISBN: check the digits.'))
      .toBeVisible();
    expect(createBookFn).not.toHaveBeenCalled();
  });

  it('needs the series a number is in', async () => {
    const page = await renderPage('/books/new');

    await fillRequired(page);
    await field(page, 'Number in the series').fill('2');
    await submit(page);

    await expect
      .element(page.getByText('Enter a number, like 1 or 2.5, and the series it belongs to.'))
      .toBeVisible();
    expect(createBookFn).not.toHaveBeenCalled();
  });

  it('names the book that has the ISBN already', async () => {
    vi.mocked(createBookFn).mockResolvedValue({
      error: 'isbn-taken',
      bookId: uuid(2),
      title: 'The Annotated Hobbit',
    });
    const page = await renderPage('/books/new');

    await fillRequired(page);
    await submit(page);

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent(
        '“The Annotated Hobbit” already has this ISBN: it is in the catalogue. View the book',
      );
    await expect
      .element(page.getByRole('link', { name: 'View the book' }))
      .toHaveAttribute('href', `/books/${uuid(2)}`);
  });

  it('keeps what was typed when it fails', async () => {
    vi.mocked(createBookFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage('/books/new');

    await fillRequired(page);
    await submit(page);

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('The book could not be added. Try again in a moment.');
    await expect.element(field(page, 'Title')).toHaveValue('The Hobbit');
  });
});

it('previews the cover', async () => {
  const page = await renderPage('/books/new');
  // The app's own logo: a picture that needs no network.
  const cover = new URL('/logo512.png', location.origin).href;

  await field(page, 'Title').fill('The Hobbit');
  await field(page, 'Cover image').fill(cover);

  await expect
    .element(page.getByRole('img', { name: 'Cover of The Hobbit' }))
    .toHaveAttribute('src', cover);
});
