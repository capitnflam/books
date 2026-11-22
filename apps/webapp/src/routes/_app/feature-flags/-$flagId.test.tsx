import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteFeatureFlagFn,
  getFeatureFlagFn,
  grantFeatureFlagFn,
  listFeatureFlagsFn,
  listFlagCandidatesFn,
  listFlagHoldersFn,
  revokeFeatureFlagFn,
  updateFeatureFlagFn,
} from '#/services/feature-flags/feature-flags.functions';
import { flagCandidate, flagDetails, flagHolder, uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

type Page = Awaited<ReturnType<typeof renderPage>>;

const flagId = uuid(60);
const path = `/feature-flags/${flagId}`;
const actionFailed = 'That change could not be made. Reload the page and try again.';

const alan = flagHolder();
const grace = flagCandidate();
const joan = flagCandidate({ id: uuid(73), displayName: 'Joan Clarke' });

const holders = (page: Page) => page.getByRole('region', { name: 'Users granted the flag' });
const candidates = (page: Page) => page.getByRole('region', { name: 'Users without the flag' });

/** What the server knows: who has the flag, and who doesn't. */
function serverHas({
  granted = [alan],
  others = [grace, joan],
}: {
  granted?: ReturnType<typeof flagHolder>[];
  others?: ReturnType<typeof flagCandidate>[];
}) {
  vi.mocked(listFlagHoldersFn).mockResolvedValue({ total: granted.length, users: granted });
  vi.mocked(listFlagCandidatesFn).mockResolvedValue({ total: others.length, users: others });
}

beforeEach(() => {
  signIn(['feature-flags:manage']);
  vi.mocked(getFeatureFlagFn).mockResolvedValue(flagDetails());
  serverHas({});
});

it('shows the flag', async () => {
  const page = await renderPage(path);

  await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('BOOK_SEARCH');
  await expect.element(page.getByText('Search inside books')).toBeVisible();
  await expect.element(page.getByText('Created on January 15, 2026')).toBeVisible();
  await expect
    .element(page.getByRole('link', { name: 'All feature flags' }))
    .toHaveAttribute('href', '/feature-flags');
  expect(document.title).toBe('BOOK_SEARCH');
});

describe('the settings', () => {
  it('save the description', async () => {
    vi.mocked(updateFeatureFlagFn).mockResolvedValue(undefined);
    const page = await renderPage(path);

    await page.getByRole('textbox', { name: 'Description' }).fill('Full-text search');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect.element(page.getByText('The flag has been saved.')).toBeVisible();
    expect(updateFeatureFlagFn).toHaveBeenCalledExactlyOnceWith({
      data: { flagId, description: 'Full-text search' },
    });
  });

  it('no longer say so once the description changes again', async () => {
    vi.mocked(updateFeatureFlagFn).mockResolvedValue(undefined);
    const page = await renderPage(path);

    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect.element(page.getByText('The flag has been saved.')).toBeVisible();
    await page.getByRole('textbox', { name: 'Description' }).fill('Full-text search');

    await expect.element(page.getByText('The flag has been saved.')).not.toBeInTheDocument();
  });

  it('refuse a description that is too long', async () => {
    const page = await renderPage(path);

    await page.getByRole('textbox', { name: 'Description' }).fill('a'.repeat(501));
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect.element(page.getByText('Keep the description to 500 characters.')).toBeVisible();
    expect(updateFeatureFlagFn).not.toHaveBeenCalled();
  });

  it('say so when saving fails', async () => {
    vi.mocked(updateFeatureFlagFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage(path);

    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect.element(page.getByRole('alert')).toHaveTextContent(actionFailed);
  });
});

describe('the users who have it', () => {
  it('are listed with who granted it', async () => {
    const page = await renderPage(path);

    await expect.element(page.getByRole('heading', { name: 'Granted to (1)' })).toBeVisible();
    await expect
      .element(holders(page).getByRole('row', { name: /Alan Turing/u }))
      .toHaveTextContent('ATAlan Turingalan@example.comJanuary 15, 2026, by Ada Lovelace');
  });

  it('may be nobody', async () => {
    serverHas({ granted: [] });
    const page = await renderPage(path);

    await expect.element(page.getByText('Nobody has been granted this flag yet.')).toBeVisible();
  });

  it('lose it when it is taken back', async () => {
    vi.mocked(revokeFeatureFlagFn).mockImplementation(async () => {
      serverHas({ granted: [], others: [flagCandidate({ ...alan }), grace, joan] });

      return { count: 1 };
    });
    const page = await renderPage(path);
    const revoke = (count: number) =>
      page.getByRole('button', { name: `Take back from selected (${count})` });

    await expect.element(revoke(0)).toBeDisabled();
    await page.getByRole('checkbox', { name: 'Select Alan Turing' }).click();
    await revoke(1).click();

    await expect.element(page.getByText('Nobody has been granted this flag yet.')).toBeVisible();
    await expect.element(candidates(page).getByText('Alan Turing')).toBeVisible();
    expect(revokeFeatureFlagFn).toHaveBeenCalledExactlyOnceWith({
      data: { flagId, userIds: [alan.id] },
    });
  });

  it('keep it when taking it back fails', async () => {
    vi.mocked(revokeFeatureFlagFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage(path);

    await page.getByRole('checkbox', { name: 'Select Alan Turing' }).click();
    await page.getByRole('button', { name: 'Take back from selected (1)' }).click();

    await expect.element(page.getByRole('alert')).toHaveTextContent(actionFailed);
    await expect.element(page.getByRole('checkbox', { name: 'Select Alan Turing' })).toBeChecked();
  });
});

describe('granting it', () => {
  it('gives it to the selected users', async () => {
    vi.mocked(grantFeatureFlagFn).mockImplementation(async () => {
      serverHas({ granted: [flagHolder({ ...grace }), alan], others: [joan] });

      return { count: 1 };
    });
    const page = await renderPage(path);

    await page.getByRole('checkbox', { name: 'Select Grace Hopper' }).click();
    await page.getByRole('button', { name: 'Grant to selected (1)' }).click();

    await expect.element(page.getByRole('heading', { name: 'Granted to (2)' })).toBeVisible();
    await expect.element(holders(page).getByText('Grace Hopper')).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Grant to selected (0)' }))
      .toBeDisabled();
    expect(grantFeatureFlagFn).toHaveBeenCalledExactlyOnceWith({
      data: { flagId, userIds: [grace.id] },
    });
  });

  it('selects and unselects every loaded user at once', async () => {
    const page = await renderPage(path);
    const all = candidates(page).getByRole('checkbox', { name: 'Select every loaded user' });

    await all.click();
    await expect.element(page.getByRole('button', { name: 'Grant to selected (2)' })).toBeEnabled();

    await page.getByRole('checkbox', { name: 'Select Joan Clarke' }).click();
    await expect.element(all).toHaveAttribute('aria-checked', 'mixed');

    await all.click();
    await all.click();
    await expect
      .element(page.getByRole('button', { name: 'Grant to selected (0)' }))
      .toBeDisabled();
  });

  it('sends a big selection in batches', async () => {
    const many = Array.from({ length: 120 }, (_, index) =>
      flagCandidate({ id: uuid(1000 + index), displayName: `Reader ${index + 1}` }),
    );

    serverHas({ others: many });
    vi.mocked(grantFeatureFlagFn).mockResolvedValue({ count: 0 });
    const page = await renderPage(path);

    await candidates(page).getByRole('checkbox', { name: 'Select every loaded user' }).click();
    await page.getByRole('button', { name: 'Grant to selected (120)' }).click();

    await expect.element(page.getByRole('button', { name: 'Grant to selected (0)' })).toBeVisible();
    expect(
      vi.mocked(grantFeatureFlagFn).mock.calls.map(([{ data }]) => data.userIds.length),
    ).toEqual([100, 20]);
  });

  it('keeps the selection when it fails', async () => {
    vi.mocked(grantFeatureFlagFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage(path);

    await page.getByRole('checkbox', { name: 'Select Grace Hopper' }).click();
    await page.getByRole('button', { name: 'Grant to selected (1)' }).click();

    await expect.element(page.getByRole('alert')).toHaveTextContent(actionFailed);
    await expect.element(page.getByRole('button', { name: 'Grant to selected (1)' })).toBeEnabled();
  });

  it('finds users by name, and keeps the search in the URL', async () => {
    const page = await renderPage(path);

    await page.getByRole('checkbox', { name: 'Select Joan Clarke' }).click();
    vi.mocked(listFlagCandidatesFn).mockResolvedValue({ total: 1, users: [grace] });
    await page.getByRole('searchbox', { name: 'Search by name' }).fill('grace');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect
      .element(page.getByRole('heading', { name: 'Users without the flag matching “grace” (1)' }))
      .toBeVisible();
    expect(page.currentUrl()).toBe(`${path}?find=grace`);
    expect(listFlagCandidatesFn).toHaveBeenLastCalledWith({
      data: { flagId, q: 'grace', page: 1 },
    });
    // The selection never covers users the search doesn't show.
    await expect
      .element(page.getByRole('button', { name: 'Grant to selected (0)' }))
      .toBeDisabled();
  });

  it.each([
    ['', 'Every user has this flag already.'],
    ['?find=xyz', 'No user without the flag has a name matching “xyz”.'],
  ])('says so when there is nobody to grant it to (%s)', async (search, message) => {
    serverHas({ others: [] });
    const page = await renderPage(`${path}${search}`);

    await expect.element(page.getByText(message)).toBeVisible();
  });
});

describe('deleting it', () => {
  it('goes back to the flags once confirmed', async () => {
    vi.mocked(deleteFeatureFlagFn).mockImplementation(async () => {
      vi.mocked(getFeatureFlagFn).mockResolvedValue(null);
    });
    vi.mocked(listFeatureFlagsFn).mockResolvedValue([]);
    const page = await renderPage(path);

    await page.getByRole('button', { name: 'Delete flag' }).click();
    await expect
      .element(page.getByText('Delete “BOOK_SEARCH” and every grant of it for good?'))
      .toBeVisible();
    expect(deleteFeatureFlagFn).not.toHaveBeenCalled();
    await page.getByRole('button', { name: 'Yes, delete the flag' }).click();

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Feature flags');
    expect(page.currentUrl()).toBe('/feature-flags');
    expect(deleteFeatureFlagFn).toHaveBeenCalledExactlyOnceWith({ data: { flagId } });
  });

  it('keeps the flag when not confirmed', async () => {
    const page = await renderPage(path);

    await page.getByRole('button', { name: 'Delete flag' }).click();
    await page.getByRole('button', { name: 'Keep the flag' }).click();

    await expect.element(page.getByRole('button', { name: 'Delete flag' })).toBeVisible();
    expect(deleteFeatureFlagFn).not.toHaveBeenCalled();
  });

  it('says so when it fails', async () => {
    vi.mocked(deleteFeatureFlagFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage(path);

    await page.getByRole('button', { name: 'Delete flag' }).click();
    await page.getByRole('button', { name: 'Yes, delete the flag' }).click();

    await expect.element(page.getByRole('alert')).toHaveTextContent(actionFailed);
    expect(page.currentUrl()).toBe(path);
  });
});

describe('a flag that is not there', () => {
  it('is not found', async () => {
    vi.mocked(getFeatureFlagFn).mockResolvedValue(null);
    const page = await renderPage(path);

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Feature flag not found');
  });

  it('is not looked for when its id can’t be one', async () => {
    const page = await renderPage('/feature-flags/BOOK_SEARCH');

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Feature flag not found');
    expect(getFeatureFlagFn).not.toHaveBeenCalled();
  });
});
