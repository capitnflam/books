import { describe, expect, it, vi } from 'vitest';

import { setLocale } from '#/paraglide/runtime';
import { renderPage } from '#/testing/render-page';

type Page = Awaited<ReturnType<typeof renderPage>>;

const save = (page: Page) => page.getByRole('button', { name: 'Save the record' });

it('shows the components', async () => {
  const page = await renderPage('/sample');

  await expect
    .element(page.getByRole('heading', { level: 1 }))
    .toHaveTextContent('Component sample');
  await expect.element(page.getByRole('button', { name: 'Borrow this book' })).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  expect(document.title).toBe('Component sample');
});

it('switches the language', async () => {
  const page = await renderPage('/sample');

  await expect
    .element(page.getByRole('button', { name: 'EN' }))
    .toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'DE' }).click();

  expect(setLocale).toHaveBeenCalledWith('de');
});

describe('the form', () => {
  it.each([
    ['The Hobbit', 'The Hobbit has been added to the catalogue.'],
    ['', 'The book has been added to the catalogue.'],
  ])('saves a book titled “%s”', async (title, message) => {
    const page = await renderPage('/sample');

    await page.getByRole('textbox', { name: 'Title' }).fill(title);
    await page.getByRole('textbox', { name: 'ISBN' }).fill('978-0-261-10221-7');
    await save(page).click();

    await expect.element(page.getByRole('status')).toHaveTextContent(message);
  });

  it('refuses an ISBN of another length', async () => {
    const page = await renderPage('/sample');

    await page.getByRole('textbox', { name: 'ISBN' }).fill('978-0');
    await save(page).click();

    await expect.element(page.getByText('This ISBN has 4 digits: enter 10 or 13.')).toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: 'ISBN' }))
      .toHaveAttribute('aria-invalid', 'true');
  });

  it('copies the ISBN', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const page = await renderPage('/sample');

    await page.getByRole('textbox', { name: 'ISBN' }).fill('9780261102217');
    await page.getByRole('button', { name: 'Copy the ISBN' }).click();

    await expect.element(page.getByText('ISBN copied.')).toBeVisible();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('9780261102217');
  });

  it('says so when the browser refuses to copy', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Not allowed.'));
    const page = await renderPage('/sample');

    await page.getByRole('button', { name: 'Copy the ISBN' }).click();

    await expect.element(page.getByText('The browser did not allow copying.')).toBeVisible();
  });
});
