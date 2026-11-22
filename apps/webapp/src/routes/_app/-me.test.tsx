import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setLocale } from '#/paraglide/runtime';
import { getProfileFn, updateDisplayNameFn } from '#/services/profile/profile.functions';
import { profile } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { mockClerk, signIn } from '#/testing/session';

import type { Permission } from '@books/database';

const { user, role } = profile();

beforeEach(() => {
  signIn();
  vi.mocked(getProfileFn).mockResolvedValue(profile());
});

describe('the reader', () => {
  it('is shown with their account', async () => {
    const page = await renderPage('/me');

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Countess Lovelace');
    await expect
      .element(page.getByText('ada@example.com · Reader since January 15, 2026'))
      .toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: 'Email address' }))
      .toHaveValue('ada@example.com');
    await expect.element(page.getByRole('textbox', { name: 'Email address' })).toBeDisabled();
    expect(document.title).toBe('Profile');
  });

  it('goes by their account’s name without a name of their own', async () => {
    vi.mocked(getProfileFn).mockResolvedValue(profile({ user: { ...user, displayName: null } }));
    const page = await renderPage('/me');

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Ada Lovelace');
    await expect
      .element(page.getByRole('textbox', { name: 'Display name' }))
      .toHaveValue('Ada Lovelace');
  });

  it('changes their portrait in their Clerk account', async () => {
    const clerk = mockClerk();
    const page = await renderPage('/me');

    await page.getByRole('button', { name: 'Change portrait' }).click();

    expect(clerk.openUserProfile).toHaveBeenCalledOnce();
  });
});

describe('the display name', () => {
  it('is saved and shown', async () => {
    vi.mocked(updateDisplayNameFn).mockImplementation(async ({ data }) => {
      const renamed = { ...user, displayName: data.displayName };

      vi.mocked(getProfileFn).mockResolvedValue(profile({ user: renamed }));

      return renamed;
    });
    const page = await renderPage('/me');
    const field = page.getByRole('textbox', { name: 'Display name' });

    await field.fill('  Ada King ');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect.element(page.getByText('Your profile has been saved.')).toBeVisible();
    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Ada King');
    await expect.element(field).toHaveValue('Ada King');
    expect(updateDisplayNameFn).toHaveBeenCalledExactlyOnceWith({
      data: { displayName: 'Ada King' },
    });
  });

  it.each([
    ['empty', '  ', 'Enter a display name.'],
    ['too long', 'a'.repeat(101), 'Shorten the display name to 100 characters or fewer.'],
  ])('is refused when %s', async (_, name, message) => {
    const page = await renderPage('/me');

    await page.getByRole('textbox', { name: 'Display name' }).fill(name);
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect.element(page.getByText(message)).toBeVisible();
    expect(updateDisplayNameFn).not.toHaveBeenCalled();
  });

  it('stays as typed when saving fails', async () => {
    vi.mocked(updateDisplayNameFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderPage('/me');

    await page.getByRole('textbox', { name: 'Display name' }).fill('Ada King');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect
      .element(page.getByText('Your profile could not be saved. Try again in a moment.'))
      .toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: 'Display name' }))
      .toHaveValue('Ada King');
  });
});

describe('the reading room', () => {
  it('switches the language', async () => {
    const page = await renderPage('/me');

    await expect
      .element(page.getByRole('button', { name: 'English' }))
      .toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Français' }).click();

    expect(setLocale).toHaveBeenCalledWith('fr');
  });

  it('switches the theme', async () => {
    const page = await renderPage('/me');
    const dark = page.getByRole('button', { name: 'Dark' });

    await expect.element(dark).toHaveAttribute('aria-pressed', 'false');
    await dark.click();

    await expect.element(dark).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveClass('dark');
  });
});

describe('the role', () => {
  it('is shown with its permissions', async () => {
    const page = await renderPage('/me');

    await expect.element(page.getByRole('heading', { name: 'moderator' })).toBeVisible();
    await expect.element(page.getByText('Granted on January 15, 2026')).toBeVisible();
    await expect.element(page.getByText('Looks after the catalogue')).toBeVisible();
    await expect
      .element(page.getByRole('list', { name: 'Permissions of the moderator role' }))
      .toHaveTextContent('Keep a personal collectionLook after the shared catalogue');
  });

  it('shows a permission the code no longer has as it is stored', async () => {
    vi.mocked(getProfileFn).mockResolvedValue(
      profile({ role: { ...role!, permissions: ['loans:manage' as Permission] } }),
    );
    const page = await renderPage('/me');

    await expect.element(page.getByText('loans:manage')).toBeVisible();
  });

  it('may be missing', async () => {
    vi.mocked(getProfileFn).mockResolvedValue(profile({ role: undefined }));
    const page = await renderPage('/me');

    await expect
      .element(page.getByText('You have no role yet: you can use the library, but not manage it.'))
      .toBeVisible();
  });
});

describe('early access', () => {
  it('lists the reader’s features, by key without a description', async () => {
    vi.mocked(getProfileFn).mockResolvedValue(
      profile({
        featureFlags: [
          { id: '1', key: 'BOOK_SEARCH', description: 'Search inside books' },
          { id: '2', key: 'LOANS', description: null },
        ],
      }),
    );
    const page = await renderPage('/me');
    const section = page.getByRole('region', { name: 'Early access' });

    await expect.element(section.getByText('Search inside books')).toBeVisible();
    await expect.element(section.getByText('BOOK_SEARCH')).toBeVisible();
    await expect.element(section.getByText('LOANS')).toBeVisible();
  });

  it('may have nothing', async () => {
    vi.mocked(getProfileFn).mockResolvedValue(profile({ featureFlags: [] }));
    const page = await renderPage('/me');

    await expect.element(page.getByText('No early-access features for now.')).toBeVisible();
  });
});

describe('signing in and security', () => {
  it('is managed in the Clerk account', async () => {
    const clerk = mockClerk();
    const page = await renderPage('/me');

    await page.getByRole('button', { name: 'Manage sign-in and security' }).click();

    expect(clerk.openUserProfile).toHaveBeenCalledOnce();
  });

  it('signs out, back to the home page', async () => {
    const clerk = mockClerk();
    const page = await renderPage('/me');

    await page.getByRole('button', { name: 'Sign out' }).click();

    expect(clerk.signOut).toHaveBeenCalledExactlyOnceWith({ redirectUrl: '/' });
  });
});
