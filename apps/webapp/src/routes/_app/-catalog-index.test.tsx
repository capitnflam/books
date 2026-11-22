import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteIndexEntriesFn, listIndexFn } from '#/services/catalog/catalog.functions';
import { indexEntry, pageOf, uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

type Page = Awaited<ReturnType<typeof renderPage>>;

const path = '/catalog-index';
const tolkien = indexEntry();
const nobody = indexEntry({ id: uuid(31), name: 'Nobody Special', bookCount: 0 });
const nemo = indexEntry({ id: uuid(32), name: 'Captain Nemo', bookCount: 0 });
const middleEarth = indexEntry({ id: uuid(40), name: 'Middle-earth', bookCount: 4 });

/** What the server lists, whatever the part of the index. */
const serverLists = (...entries: ReturnType<typeof indexEntry>[]) =>
  vi.mocked(listIndexFn).mockResolvedValue({ total: entries.length, entries });

const select = (page: Page, name: string) => page.getByRole('checkbox', { name: `Select ${name}` });
const deleteButton = (page: Page, count: number) =>
  page.getByRole('button', { name: `Delete selected (${count})` });

beforeEach(() => {
  signIn(['catalog:manage']);
  serverLists(tolkien, nobody, nemo);
});

describe('the list', () => {
  it('starts with the authors and how many books credit them', async () => {
    const page = await renderPage(path);

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Catalogue index');
    await expect.element(page.getByRole('heading', { name: 'Authors (3)' })).toBeVisible();
    await expect
      .element(page.getByRole('row', { name: /Tolkien/u }))
      .toHaveTextContent('J. R. R. Tolkien2');
    await expect
      .element(page.getByRole('link', { name: 'Authors' }))
      .toHaveAttribute('aria-current', 'page');
    expect(listIndexFn).toHaveBeenCalledWith({
      data: { kind: 'authors', q: undefined, unused: undefined, page: 1 },
    });
    expect(document.title).toBe('Catalogue index');
  });

  it.each([
    ['Series', 'series'],
    ['Publishers', 'publishers'],
    ['Subjects', 'subjects'],
  ] as const)('shows the %s', async (name, kind) => {
    const page = await renderPage(path);

    await page.getByRole('link', { name }).click();

    await expect.element(page.getByRole('heading', { name: `${name} (3)` })).toBeVisible();
    await expect.element(page.getByRole('link', { name })).toHaveAttribute('aria-current', 'page');
    await expect
      .element(page.getByRole('link', { name: 'Authors' }))
      .not.toHaveAttribute('aria-current');
    expect(page.currentUrl()).toBe(`${path}?kind=${kind}`);
    expect(listIndexFn).toHaveBeenLastCalledWith({
      data: { kind, q: undefined, unused: undefined, page: 1 },
    });
  });

  it('is searched by name, and narrowed to what no book uses', async () => {
    const page = await renderPage(`${path}?kind=series`);

    await page.getByRole('searchbox', { name: 'Search by name' }).fill('earth');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect
      .element(page.getByRole('heading', { name: 'Series matching “earth” (3)' }))
      .toBeVisible();

    serverLists();
    await page.getByRole('checkbox', { name: 'Only those no book uses' }).click();

    await expect.element(page.getByText('Nothing here.')).toBeVisible();
    expect(page.currentUrl()).toBe(`${path}?kind=series&q=earth&unused=true`);
    expect(listIndexFn).toHaveBeenLastCalledWith({
      data: { kind: 'series', q: 'earth', unused: true, page: 1 },
    });

    serverLists(middleEarth);
    await page.getByRole('checkbox', { name: 'Only those no book uses' }).click();

    await expect.element(page.getByText('Middle-earth')).toBeVisible();
    expect(page.currentUrl()).toBe(`${path}?kind=series&q=earth`);
  });

  it('loads more as it scrolls', async () => {
    const many = Array.from({ length: 30 }, (_, index) =>
      indexEntry({ id: uuid(1000 + index), name: `Author ${index + 1}` }),
    );

    vi.mocked(listIndexFn).mockImplementation(async ({ data }) => ({
      total: many.length,
      entries: pageOf(many, data.page),
    }));
    const page = await renderPage(path);

    await expect.element(page.getByText('25 of 30 loaded')).toBeVisible();
    const list = page.getByRole('region', { name: 'Authors', exact: true }).element();

    list.scrollTop = list.scrollHeight;

    await expect.element(page.getByText('30 of 30 loaded')).toBeVisible();
  });
});

describe('deleting', () => {
  it('removes the selected entries once confirmed', async () => {
    vi.mocked(deleteIndexEntriesFn).mockImplementation(async () => {
      serverLists(tolkien);

      return { kept: 0 };
    });
    const page = await renderPage(path);

    await expect.element(deleteButton(page, 0)).toBeDisabled();
    await select(page, 'Nobody Special').click();
    await select(page, 'Captain Nemo').click();
    await deleteButton(page, 2).click();
    await expect.element(page.getByText('Delete the selected entries (2) for good?')).toBeVisible();
    expect(deleteIndexEntriesFn).not.toHaveBeenCalled();
    await page.getByRole('button', { name: 'Yes, delete them' }).click();

    await expect.element(page.getByRole('heading', { name: 'Authors (1)' })).toBeVisible();
    await expect.element(deleteButton(page, 0)).toBeDisabled();
    expect(deleteIndexEntriesFn).toHaveBeenCalledExactlyOnceWith({
      data: { kind: 'authors', ids: [nobody.id, nemo.id] },
    });
  });

  it('is not offered for an author a book credits', async () => {
    const page = await renderPage(path);

    await expect.element(select(page, 'J. R. R. Tolkien')).toBeDisabled();
    await page
      .getByRole('checkbox', { name: 'Select every loaded entry that can be deleted' })
      .click();

    await expect.element(deleteButton(page, 2)).toBeEnabled();
    await expect
      .element(page.getByText('An author credited on a book can’t be deleted', { exact: false }))
      .toBeVisible();
  });

  it('is offered for a series with books', async () => {
    vi.mocked(deleteIndexEntriesFn).mockResolvedValue({ kept: 0 });
    serverLists(middleEarth);
    const page = await renderPage(`${path}?kind=series`);

    await select(page, 'Middle-earth').click();
    await deleteButton(page, 1).click();
    await page.getByRole('button', { name: 'Yes, delete them' }).click();

    await expect.element(deleteButton(page, 0)).toBeVisible();
    expect(deleteIndexEntriesFn).toHaveBeenCalledExactlyOnceWith({
      data: { kind: 'series', ids: [middleEarth.id] },
    });
  });

  it('says when an author was credited meanwhile, and so kept', async () => {
    vi.mocked(deleteIndexEntriesFn).mockResolvedValue({ kept: 1 });
    const page = await renderPage(path);

    await select(page, 'Nobody Special').click();
    await deleteButton(page, 1).click();
    await page.getByRole('button', { name: 'Yes, delete them' }).click();

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('Some authors were not deleted, because a book credits them (1).');
  });

  it('sends a big selection in batches', async () => {
    serverLists(
      ...Array.from({ length: 120 }, (_, index) =>
        indexEntry({ id: uuid(1000 + index), name: `Author ${index + 1}`, bookCount: 0 }),
      ),
    );
    vi.mocked(deleteIndexEntriesFn).mockResolvedValue({ kept: 0 });
    const page = await renderPage(path);

    await page
      .getByRole('checkbox', { name: 'Select every loaded entry that can be deleted' })
      .click();
    await deleteButton(page, 120).click();
    await page.getByRole('button', { name: 'Yes, delete them' }).click();

    await expect.element(deleteButton(page, 0)).toBeVisible();
    expect(vi.mocked(deleteIndexEntriesFn).mock.calls.map(([{ data }]) => data.ids.length)).toEqual(
      [100, 20],
    );
  });

  it('keeps the entries when not confirmed', async () => {
    const page = await renderPage(path);

    await select(page, 'Nobody Special').click();
    await deleteButton(page, 1).click();
    await page.getByRole('button', { name: 'Keep them' }).click();

    await expect.element(deleteButton(page, 1)).toBeVisible();
    expect(deleteIndexEntriesFn).not.toHaveBeenCalled();
  });

  it('keeps the selection when it fails', async () => {
    vi.mocked(deleteIndexEntriesFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage(path);

    await select(page, 'Nobody Special').click();
    await deleteButton(page, 1).click();
    await page.getByRole('button', { name: 'Yes, delete them' }).click();

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('The entries could not be deleted. Try again in a moment.');
    await expect.element(select(page, 'Nobody Special')).toBeChecked();
  });

  it('never covers entries the list no longer shows', async () => {
    const page = await renderPage(path);

    await select(page, 'Nobody Special').click();
    await expect.element(deleteButton(page, 1)).toBeEnabled();
    await page.getByRole('link', { name: 'Series' }).click();

    await expect.element(page.getByRole('heading', { name: 'Series (3)' })).toBeVisible();
    await expect.element(deleteButton(page, 0)).toBeDisabled();
  });
});
