import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBookFn, updateBookFn } from '#/services/catalog/catalog.functions';
import { bookDetails, uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

const bookPath = `/books/${uuid(1)}`;

beforeEach(() => {
  signIn(['catalog:manage']);
  vi.mocked(getBookFn).mockResolvedValue(bookDetails({}, { canEdit: true }));
});

describe('the form', () => {
  it('starts from the saved book', async () => {
    const page = await renderPage(`${bookPath}/edit`);
    const field = (name: string) => page.getByRole('textbox', { name });

    await expect.element(field('Title')).toHaveValue('The Hobbit');
    await expect.element(field('Subtitle')).toHaveValue('There and Back Again');
    await expect.element(field('Name of contributor 1')).toHaveValue('J. R. R. Tolkien');
    await expect.element(field('Description')).toHaveValue('A hobbit leaves home.');
    await expect.element(field('First published')).toHaveValue('1937');
    await expect.element(field('Name of series 1')).toHaveValue('Middle-earth');
    await expect.element(field('Book’s number in series 1')).toHaveValue('1');
    await expect.element(field('Subjects')).toHaveValue('Dragons');
    await expect
      .element(page.getByRole('combobox', { name: 'Original language' }))
      .toHaveValue('en');
    await expect.element(page.getByRole('button', { name: 'Remove Fantasy' })).toBeVisible();
    expect(document.title).toBe('Edit a book');
  });

  it('offers the credits of a work, not those of an edition', async () => {
    const page = await renderPage(`${bookPath}/edit`);
    const roles = page.getByRole('combobox', { name: 'Role of contributor 1' });

    await expect.element(roles.getByRole('option', { name: 'Illustrator' })).toBeInTheDocument();
    await expect.element(roles.getByRole('option', { name: 'Translator' })).not.toBeInTheDocument();
  });

  it('leads back to the book without saving', async () => {
    const page = await renderPage(`${bookPath}/edit`);

    await page.getByText('Cancel').click();

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('The Hobbit');
    expect(updateBookFn).not.toHaveBeenCalled();
  });
});

describe('saving', () => {
  it('sends the changes and goes back to the changed book', async () => {
    vi.mocked(updateBookFn).mockImplementation(async () => {
      vi.mocked(getBookFn).mockResolvedValue(bookDetails({ title: 'The Hobbit, revised' }));

      return { error: null };
    });
    const page = await renderPage(`${bookPath}/edit`);

    await page.getByRole('textbox', { name: 'Title' }).fill('The Hobbit, revised');
    await page.getByRole('button', { name: 'Save the changes' }).click();

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('The Hobbit, revised');
    expect(page.currentUrl()).toBe(bookPath);
    expect(updateBookFn).toHaveBeenCalledExactlyOnceWith({
      data: {
        bookId: uuid(1),
        title: 'The Hobbit, revised',
        subtitle: 'There and Back Again',
        contributors: [{ name: 'J. R. R. Tolkien', role: 'author' }],
        description: 'A hobbit leaves home.',
        originalLanguage: 'en',
        firstPublishedYear: '1937',
        series: [{ name: 'Middle-earth', position: '1' }],
        genres: ['fantasy'],
        subjects: 'Dragons',
      },
    });
  });

  it('never shows the book as it was again', async () => {
    let reloaded = false;

    vi.mocked(updateBookFn).mockImplementation(async () => {
      vi.mocked(getBookFn).mockImplementation(async () => {
        await vi.waitUntil(() => reloaded, { timeout: 10_000 });

        return bookDetails({ title: 'The Hobbit, revised' });
      });

      return { error: null };
    });
    const page = await renderPage(bookPath);

    await page.getByText('Edit this book').click();
    await page.getByRole('textbox', { name: 'Title' }).fill('The Hobbit, revised');

    const headings: (string | null | undefined)[] = [];
    const observer = new MutationObserver(() => {
      headings.push(page.container.querySelector('h1')?.textContent);
    });

    observer.observe(page.container, { childList: true, subtree: true, characterData: true });
    await page.getByRole('button', { name: 'Save the changes' }).click();
    await expect.poll(() => updateBookFn).toHaveResolved();
    reloaded = true;
    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('The Hobbit, revised');
    observer.disconnect();

    expect(headings).not.toContain('The Hobbit');
  });

  it('sends contributors and series added and removed', async () => {
    vi.mocked(updateBookFn).mockResolvedValue({ error: null });
    const page = await renderPage(`${bookPath}/edit`);

    await page.getByRole('button', { name: 'Add a contributor' }).click();
    await page.getByRole('textbox', { name: 'Name of contributor 2' }).fill('Alan Lee');
    await page
      .getByRole('combobox', { name: 'Role of contributor 2' })
      .selectOptions('Illustrator');
    await page.getByRole('button', { name: 'Remove contributor 1' }).click();
    await page.getByRole('button', { name: 'Add a series' }).click();
    await page.getByRole('textbox', { name: 'Name of series 2' }).fill('Penguin Classics');
    await page.getByRole('button', { name: 'Save the changes' }).click();

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('The Hobbit');
    expect(updateBookFn).toHaveBeenCalledExactlyOnceWith({
      data: expect.objectContaining({
        contributors: [{ name: 'Alan Lee', role: 'illustrator' }],
        series: [
          { name: 'Middle-earth', position: '1' },
          { name: 'Penguin Classics', position: '' },
        ],
      }),
    });
  });

  it('waits for fields to be corrected', async () => {
    vi.mocked(updateBookFn).mockResolvedValue({ error: null });
    const page = await renderPage(`${bookPath}/edit`);
    const title = page.getByRole('textbox', { name: 'Title' });

    await title.fill('');
    await page.getByRole('textbox', { name: 'First published' }).fill('long ago');
    await page.getByRole('textbox', { name: 'Name of series 1' }).fill('');
    await page.getByRole('button', { name: 'Remove Fantasy' }).click();
    await page.getByRole('button', { name: 'Save the changes' }).click();

    await expect.element(page.getByText('Some fields need correcting.')).toBeVisible();
    await expect.element(title).toHaveAttribute('aria-invalid', 'true');
    await expect.element(page.getByText('Enter the title, in up to 500 characters.')).toBeVisible();
    await expect.element(page.getByText('Enter a year, like 1937.')).toBeVisible();
    await expect
      .element(page.getByText('Enter the series this number belongs to, in up to 200 characters.'))
      .toBeVisible();
    await expect.element(page.getByText('Choose at least one genre.')).toBeVisible();
    expect(updateBookFn).not.toHaveBeenCalled();

    await title.fill('The Hobbit');

    await expect
      .element(page.getByText('Enter the title, in up to 500 characters.'))
      .not.toBeInTheDocument();
  });

  it('says so when the book is gone', async () => {
    vi.mocked(updateBookFn).mockResolvedValue({ error: 'not-found' });
    const page = await renderPage(`${bookPath}/edit`);

    await page.getByRole('button', { name: 'Save the changes' }).click();

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('This is no longer in the catalogue.');
  });

  it('keeps what was typed when it fails', async () => {
    vi.mocked(updateBookFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage(`${bookPath}/edit`);

    await page.getByRole('textbox', { name: 'Title' }).fill('The Hobbit, revised');
    await page.getByRole('button', { name: 'Save the changes' }).click();

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('The changes could not be saved. Try again in a moment.');
    await expect
      .element(page.getByRole('textbox', { name: 'Title' }))
      .toHaveValue('The Hobbit, revised');
    expect(page.currentUrl()).toBe(`${bookPath}/edit`);
  });
});

it('says so when there is no such book', async () => {
  vi.mocked(getBookFn).mockResolvedValue(null);
  const page = await renderPage(`${bookPath}/edit`);

  await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Book not found');
});
