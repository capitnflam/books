import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createFeatureFlagFn,
  getFeatureFlagFn,
  listFeatureFlagsFn,
  listFlagCandidatesFn,
  listFlagHoldersFn,
} from '#/services/feature-flags/feature-flags.functions';
import { flagDetails, listedFlag, uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

beforeEach(() => {
  signIn(['feature-flags:manage']);
  vi.mocked(listFeatureFlagsFn).mockResolvedValue([]);
});

describe('the list', () => {
  it('shows each flag with how many users have it', async () => {
    vi.mocked(listFeatureFlagsFn).mockResolvedValue([
      listedFlag(),
      listedFlag({ id: uuid(61), key: 'LOANS', description: null, userCount: 0 }),
    ]);
    const page = await renderPage('/feature-flags');

    await expect.element(page.getByRole('heading', { name: 'All flags (2)' })).toBeVisible();
    await expect
      .element(page.getByRole('row', { name: /BOOK_SEARCH/u }))
      .toHaveTextContent('BOOK_SEARCHSearch inside books3January 15, 2026');
    await expect
      .element(page.getByRole('row', { name: /LOANS/u }))
      .toHaveTextContent('LOANS0January 15, 2026');
    await expect
      .element(page.getByRole('link', { name: 'BOOK_SEARCH' }))
      .toHaveAttribute('href', `/feature-flags/${uuid(60)}`);
    expect(document.title).toBe('Feature flags');
  });

  it('says so when there are none', async () => {
    const page = await renderPage('/feature-flags');

    await expect.element(page.getByText('No feature flags yet.')).toBeVisible();
    await expect.element(page.getByRole('table')).not.toBeInTheDocument();
  });
});

describe('creating a flag', () => {
  it('opens the new flag', async () => {
    vi.mocked(createFeatureFlagFn).mockResolvedValue({ id: uuid(60), error: null });
    vi.mocked(getFeatureFlagFn).mockResolvedValue(flagDetails());
    vi.mocked(listFlagHoldersFn).mockResolvedValue({ total: 0, users: [] });
    vi.mocked(listFlagCandidatesFn).mockResolvedValue({ total: 0, users: [] });
    const page = await renderPage('/feature-flags');

    await page.getByRole('textbox', { name: 'Key' }).fill('BOOK_SEARCH');
    await page.getByRole('textbox', { name: 'Description' }).fill('Search inside books');
    await page.getByRole('button', { name: 'Create the flag' }).click();

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('BOOK_SEARCH');
    expect(page.currentUrl()).toBe(`/feature-flags/${uuid(60)}`);
    expect(createFeatureFlagFn).toHaveBeenCalledExactlyOnceWith({
      data: { key: 'BOOK_SEARCH', description: 'Search inside books' },
    });
  });

  it.each([
    ['empty', '', 'Enter a key.'],
    ['too long', 'A'.repeat(65), 'Keep the key to 64 characters.'],
    [
      'in another form',
      'book-search',
      'Use only capital letters and digits, with single underscores between words.',
    ],
  ])('refuses a key that is %s', async (_, key, message) => {
    const page = await renderPage('/feature-flags');

    await page.getByRole('textbox', { name: 'Key' }).fill(key);
    await page.getByRole('button', { name: 'Create the flag' }).click();

    await expect.element(page.getByText(message)).toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: 'Key' }))
      .toHaveAttribute('aria-invalid', 'true');
    expect(createFeatureFlagFn).not.toHaveBeenCalled();
  });

  it('refuses a description that is too long', async () => {
    const page = await renderPage('/feature-flags');

    await page.getByRole('textbox', { name: 'Key' }).fill('LOANS');
    await page.getByRole('textbox', { name: 'Description' }).fill('a'.repeat(501));
    await page.getByRole('button', { name: 'Create the flag' }).click();

    await expect.element(page.getByText('Keep the description to 500 characters.')).toBeVisible();
    expect(createFeatureFlagFn).not.toHaveBeenCalled();
  });

  it('says so when another flag has the key, and sends it again when asked', async () => {
    vi.mocked(createFeatureFlagFn).mockResolvedValue({ id: null, error: 'key-taken' });
    const page = await renderPage('/feature-flags');
    const create = page.getByRole('button', { name: 'Create the flag' });

    await page.getByRole('textbox', { name: 'Key' }).fill('BOOK_SEARCH');
    await create.click();

    await expect.element(page.getByText('Another flag already has this key.')).toBeVisible();

    await create.click();

    await expect.poll(() => vi.mocked(createFeatureFlagFn).mock.calls.length).toBe(2);
  });

  it('keeps what was typed when it fails', async () => {
    vi.mocked(createFeatureFlagFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage('/feature-flags');

    await page.getByRole('textbox', { name: 'Key' }).fill('LOANS');
    await page.getByRole('button', { name: 'Create the flag' }).click();

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('The flag could not be created. Try again in a moment.');
    await expect.element(page.getByRole('textbox', { name: 'Key' })).toHaveValue('LOANS');
  });
});
