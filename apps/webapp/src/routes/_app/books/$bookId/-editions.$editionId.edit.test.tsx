import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteEditionFn, getBookFn, updateEditionFn } from '#/services/catalog/catalog.functions';
import { bookDetails, credit, edition, uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

const bookPath = `/books/${uuid(1)}`;
const path = `${bookPath}/editions/${uuid(10)}/edit`;

beforeEach(() => {
  signIn(['catalog:manage']);
  vi.mocked(getBookFn).mockResolvedValue(
    bookDetails(
      {
        editions: [
          edition({ id: uuid(11), title: 'Le Hobbit' }),
          edition({ contributors: [credit('Rob Inglis', 'narrator')] }),
        ],
      },
      { canEdit: true },
    ),
  );
});

describe('the form', () => {
  it('starts from the saved edition', async () => {
    const page = await renderPage(path);
    const field = (name: string) => page.getByRole('textbox', { name });

    await expect.element(field('ISBN')).toHaveValue('9780261102217');
    await expect.element(field('Title of this edition')).toHaveValue('');
    await expect.element(field('Name of contributor 1')).toHaveValue('Rob Inglis');
    await expect.element(field('Publisher')).toHaveValue('Allen & Unwin');
    await expect.element(field('Published')).toHaveValue('1951-07-19');
    await expect.element(field('Edition')).toHaveValue('2nd edition');
    await expect.element(field('Pages')).toHaveValue('310');
    await expect.element(page.getByRole('combobox', { name: 'Language' })).toHaveValue('en');
    await expect.element(page.getByRole('combobox', { name: 'Format' })).toHaveValue('hardcover');
    expect(document.title).toBe('Edit an edition');
  });

  it('credits people on an edition, but not as its author', async () => {
    const page = await renderPage(path);
    const roles = page.getByRole('combobox', { name: 'Role of contributor 1' });

    await expect.element(roles).toHaveValue('narrator');
    await expect.element(roles.getByRole('option', { name: 'Translator' })).toBeInTheDocument();
    await expect.element(roles.getByRole('option', { name: 'Author' })).not.toBeInTheDocument();
  });

  it('asks for the running time of an audiobook instead of its pages', async () => {
    const page = await renderPage(path);

    await page.getByRole('combobox', { name: 'Format' }).selectOptions('Audiobook');

    await expect
      .element(page.getByRole('textbox', { name: 'Running time, in minutes' }))
      .toBeVisible();
    await expect.element(page.getByRole('textbox', { name: 'Pages' })).not.toBeInTheDocument();
  });
});

describe('saving', () => {
  it('sends the changes and goes back to the book', async () => {
    vi.mocked(updateEditionFn).mockResolvedValue({ error: null });
    const page = await renderPage(path);

    await page.getByRole('textbox', { name: 'Pages' }).fill('320');
    await page.getByRole('combobox', { name: 'Format' }).selectOptions('Paperback');
    await page.getByRole('button', { name: 'Save the changes' }).click();

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('The Hobbit');
    expect(page.currentUrl()).toBe(bookPath);
    expect(updateEditionFn).toHaveBeenCalledExactlyOnceWith({
      data: {
        editionId: uuid(10),
        isbn: '9780261102217',
        title: '',
        subtitle: '',
        contributors: [{ name: 'Rob Inglis', role: 'narrator' }],
        editionStatement: '2nd edition',
        publisher: 'Allen & Unwin',
        published: '1951-07-19',
        language: 'en',
        format: 'paperback',
        pageCount: '320',
        durationMinutes: '',
        coverImageUrl: '',
      },
    });
  });

  it('waits for fields to be corrected', async () => {
    const page = await renderPage(path);

    await page.getByRole('textbox', { name: 'ISBN' }).fill('9780261102218');
    await page.getByRole('textbox', { name: 'Published' }).fill('1951-02-30');
    await page.getByRole('textbox', { name: 'Pages' }).fill('0');
    await page.getByRole('textbox', { name: 'Cover image' }).fill('cover.jpg');
    await page.getByRole('button', { name: 'Save the changes' }).click();

    await expect.element(page.getByText('Some fields need correcting.')).toBeVisible();
    await expect
      .element(page.getByText('This is not a valid ISBN: check the digits.'))
      .toBeVisible();
    await expect.element(page.getByText('Enter a year, or a date like 1937-09-21.')).toBeVisible();
    await expect.element(page.getByText('Enter a whole number above zero.')).toBeVisible();
    await expect
      .element(page.getByText('Enter a web address starting with https://.'))
      .toBeVisible();
    expect(updateEditionFn).not.toHaveBeenCalled();
  });

  it('names the book that has the ISBN already', async () => {
    vi.mocked(updateEditionFn).mockResolvedValue({
      error: 'isbn-taken',
      bookId: uuid(2),
      title: 'The Silmarillion',
    });
    const page = await renderPage(path);

    await page.getByRole('button', { name: 'Save the changes' }).click();

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent(
        '“The Silmarillion” already has this ISBN: it is in the catalogue. View the book',
      );
    await expect
      .element(page.getByRole('link', { name: 'View the book' }))
      .toHaveAttribute('href', `/books/${uuid(2)}`);
  });

  it('keeps what was typed when it fails', async () => {
    vi.mocked(updateEditionFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage(path);

    await page.getByRole('textbox', { name: 'Pages' }).fill('320');
    await page.getByRole('button', { name: 'Save the changes' }).click();

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('The changes could not be saved. Try again in a moment.');
    await expect.element(page.getByRole('textbox', { name: 'Pages' })).toHaveValue('320');
  });
});

describe('deleting', () => {
  it('goes back to the book once confirmed', async () => {
    vi.mocked(deleteEditionFn).mockImplementation(async () => {
      vi.mocked(getBookFn).mockResolvedValue(bookDetails({ editions: [] }, { canEdit: true }));
    });
    const page = await renderPage(path);

    await expect
      .element(page.getByText('The book and its other editions stay.', { exact: false }))
      .toBeVisible();
    await page.getByRole('button', { name: 'Delete edition' }).click();
    await expect
      .element(page.getByText('Delete this edition of “The Hobbit” for good?'))
      .toBeVisible();
    expect(deleteEditionFn).not.toHaveBeenCalled();
    await page.getByRole('button', { name: 'Yes, delete the edition' }).click();

    await expect.element(page.getByText('No edition of this book is recorded.')).toBeVisible();
    expect(page.currentUrl()).toBe(bookPath);
    expect(deleteEditionFn).toHaveBeenCalledExactlyOnceWith({ data: { editionId: uuid(10) } });
  });

  it('warns that the only edition leaves the book without any', async () => {
    vi.mocked(getBookFn).mockResolvedValue(
      bookDetails({ editions: [edition()] }, { canEdit: true }),
    );
    const page = await renderPage(path);

    await expect
      .element(page.getByText('This is the book’s only edition', { exact: false }))
      .toBeVisible();
  });

  it('keeps the edition when not confirmed', async () => {
    const page = await renderPage(path);

    await page.getByRole('button', { name: 'Delete edition' }).click();
    await page.getByRole('button', { name: 'Keep the edition' }).click();

    await expect.element(page.getByRole('button', { name: 'Delete edition' })).toBeVisible();
    expect(deleteEditionFn).not.toHaveBeenCalled();
  });

  it('says so when it fails', async () => {
    vi.mocked(deleteEditionFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage(path);

    await page.getByRole('button', { name: 'Delete edition' }).click();
    await page.getByRole('button', { name: 'Yes, delete the edition' }).click();

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('The edition could not be deleted. Try again in a moment.');
    expect(page.currentUrl()).toBe(path);
  });
});

it('says so when the book has no such edition', async () => {
  const page = await renderPage(`${bookPath}/editions/${uuid(99)}/edit`);

  await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Book not found');
});
