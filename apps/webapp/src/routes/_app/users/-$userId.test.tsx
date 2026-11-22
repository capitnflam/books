import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteUserFn,
  getUserDetailsFn,
  listUsersFn,
  setRoleFn,
  setUserBlockedFn,
  updateUserDisplayNameFn,
} from '#/services/user-management/user-management.functions';
import { userDetails, uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

const userId = uuid(71);
const path = `/users/${userId}`;
const actionFailed = 'That change could not be made. Reload the page and try again.';

const { account, role } = userDetails();

/** Opens the user's page; what the server answers later can change with `getUserDetailsFn`. */
async function renderUser(details: Parameters<typeof userDetails>[0] = {}) {
  vi.mocked(getUserDetailsFn).mockResolvedValue(userDetails(details));

  return renderPage(path);
}

beforeEach(() => signIn(['users:read']));

describe('the user', () => {
  it('is shown with their account', async () => {
    const page = await renderUser();

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Grace Hopper');
    await expect
      .element(page.getByText('grace@example.com · Reader since January 15, 2026'))
      .toBeVisible();
    await expect.element(page.getByText('Last signed in on February 20, 2026')).toBeVisible();
    expect(document.title).toBe('Grace Hopper');
  });

  it.each([
    ['their account’s name', { displayName: null }, account, 'Grace Brewster Hopper'],
    ['their email', { displayName: null }, { ...account!, fullName: null }, 'grace@example.com'],
    ['no name', { displayName: null }, null, 'Unnamed user'],
  ])('goes by %s without a name of their own', async (_, user, theirAccount, name) => {
    const page = await renderUser({
      user: { ...userDetails().user, ...user },
      account: theirAccount,
    });

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent(name);
  });

  it('may not have signed in yet', async () => {
    const page = await renderUser({ account: { ...account!, lastSignInAt: null } });

    await expect.element(page.getByText('Has not signed in yet')).toBeVisible();
  });

  it('may be blocked', async () => {
    const page = await renderUser({ account: { ...account!, blocked: true } });

    await expect.element(page.getByText('Blocked: cannot sign in')).toBeVisible();
  });

  it('may have no account left', async () => {
    const page = await renderUser({ account: null });

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('No sign-in account was found for this user: it may have been deleted.');
  });

  it('can’t be changed by those who may only look', async () => {
    const page = await renderUser();

    await expect.element(page.getByRole('heading', { name: 'Role and access' })).toBeVisible();
    await expect.element(page.getByRole('textbox')).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Block' })).not.toBeInTheDocument();
    await expect
      .element(page.getByRole('button', { name: 'Delete account' }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole('button', { name: 'Switch to admin' }))
      .not.toBeInTheDocument();
  });
});

describe('renaming', () => {
  it('saves the name and shows it', async () => {
    vi.mocked(updateUserDisplayNameFn).mockImplementation(async ({ data }) => {
      vi.mocked(getUserDetailsFn).mockResolvedValue(
        userDetails({ user: { ...userDetails().user, displayName: data.displayName } }),
      );
    });
    const page = await renderUser({ can: { manageUser: true, manageRoles: false } });

    await page.getByRole('textbox', { name: 'Display name' }).fill('  Admiral Hopper ');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Admiral Hopper');
    expect(updateUserDisplayNameFn).toHaveBeenCalledExactlyOnceWith({
      data: { userId, displayName: 'Admiral Hopper' },
    });
  });

  it('says so when it fails', async () => {
    vi.mocked(updateUserDisplayNameFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderUser({ can: { manageUser: true, manageRoles: false } });

    await page.getByRole('textbox', { name: 'Display name' }).fill('Admiral Hopper');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect.element(page.getByText(actionFailed)).toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: 'Display name' }))
      .toHaveValue('Admiral Hopper');
  });
});

describe('the role', () => {
  const can = { manageUser: false, manageRoles: true };

  it('is shown with its permissions, and who granted it', async () => {
    const page = await renderUser();

    await expect.element(page.getByRole('heading', { name: 'moderator' })).toBeVisible();
    await expect
      .element(page.getByText('Granted on January 15, 2026 by Ada Lovelace'))
      .toBeVisible();
    await expect
      .element(page.getByRole('list', { name: 'Permissions of the moderator role' }))
      .toHaveTextContent('Keep a personal collectionLook after the shared catalogue');
  });

  it('may have been granted by nobody in particular', async () => {
    const page = await renderUser({ role: { ...role!, grantedBy: null } });

    await expect.element(page.getByText('Granted on January 15, 2026')).toBeVisible();
  });

  it('is switched to another', async () => {
    vi.mocked(setRoleFn).mockImplementation(async () => {
      vi.mocked(getUserDetailsFn).mockResolvedValue(
        userDetails({ can, role: { ...role!, id: uuid(81), name: 'admin' } }),
      );
    });
    const page = await renderUser({ can });

    await expect
      .element(page.getByRole('button', { name: 'Switch to moderator' }))
      .not.toBeInTheDocument();
    await page.getByRole('button', { name: 'Switch to admin' }).click();

    await expect.element(page.getByRole('heading', { name: 'admin' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Switch to moderator' })).toBeVisible();
    expect(setRoleFn).toHaveBeenCalledExactlyOnceWith({ data: { userId, roleId: uuid(81) } });
  });

  it('is given to a user without one', async () => {
    vi.mocked(setRoleFn).mockResolvedValue(undefined);
    const page = await renderUser({ can, role: undefined });

    await expect.element(page.getByText('Grace Hopper has no role yet.')).toBeVisible();
    await page.getByRole('button', { name: 'Assign moderator' }).click();

    expect(setRoleFn).toHaveBeenCalledExactlyOnceWith({ data: { userId, roleId: uuid(80) } });
  });

  it('can’t be one’s own to change', async () => {
    const page = await renderUser({ can, isSelf: true });

    await expect.element(page.getByText('User · you')).toBeVisible();
    await expect
      .element(page.getByText('You cannot change your own role: ask another administrator.'))
      .toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Switch to admin' }))
      .not.toBeInTheDocument();
  });

  it('stays the same when the change fails', async () => {
    vi.mocked(setRoleFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderUser({ can });

    await page.getByRole('button', { name: 'Switch to admin' }).click();

    await expect.element(page.getByRole('alert')).toHaveTextContent(actionFailed);
    await expect.element(page.getByRole('button', { name: 'Switch to admin' })).toBeEnabled();
  });
});

describe('the account', () => {
  const can = { manageUser: true, manageRoles: false };

  it.each([
    ['blocked', false, 'Block', 'This user is blocked and cannot sign in.'],
    ['unblocked', true, 'Unblock', 'This user can sign in.'],
  ])('is %s', async (_, blocked, button, after) => {
    vi.mocked(setUserBlockedFn).mockImplementation(async ({ data }) => {
      vi.mocked(getUserDetailsFn).mockResolvedValue(
        userDetails({ can, account: { ...account!, blocked: data.blocked } }),
      );
    });
    const page = await renderUser({ can, account: { ...account!, blocked } });

    await page.getByRole('button', { name: button }).click();

    await expect.element(page.getByText(after)).toBeVisible();
    expect(setUserBlockedFn).toHaveBeenCalledExactlyOnceWith({
      data: { userId, blocked: !blocked },
    });
  });

  it('can’t be blocked when there is none', async () => {
    const page = await renderUser({ can, account: null });

    await expect.element(page.getByRole('button', { name: 'Delete account' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Block' })).not.toBeInTheDocument();
  });

  it('is deleted once confirmed', async () => {
    vi.mocked(deleteUserFn).mockImplementation(async () => {
      vi.mocked(getUserDetailsFn).mockResolvedValue(null);
    });
    vi.mocked(listUsersFn).mockResolvedValue({ total: 0, users: [] });
    const page = await renderUser({ can });

    await page.getByRole('button', { name: 'Delete account' }).click();
    await expect.element(page.getByText('Delete Grace Hopper’s account for good?')).toBeVisible();
    expect(deleteUserFn).not.toHaveBeenCalled();
    await page.getByRole('button', { name: 'Yes, delete the account' }).click();

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Users');
    expect(page.currentUrl()).toBe('/users');
    expect(deleteUserFn).toHaveBeenCalledExactlyOnceWith({ data: { userId } });
  });

  it('is kept when not confirmed', async () => {
    const page = await renderUser({ can });

    await page.getByRole('button', { name: 'Delete account' }).click();
    await page.getByRole('button', { name: 'Keep the account' }).click();

    await expect.element(page.getByRole('button', { name: 'Delete account' })).toBeVisible();
    expect(deleteUserFn).not.toHaveBeenCalled();
  });

  it('stays when deleting fails', async () => {
    vi.mocked(deleteUserFn).mockRejectedValue(new Error('The server is down.'));
    const page = await renderUser({ can });

    await page.getByRole('button', { name: 'Delete account' }).click();
    await page.getByRole('button', { name: 'Yes, delete the account' }).click();

    await expect.element(page.getByRole('alert')).toHaveTextContent(actionFailed);
    expect(page.currentUrl()).toBe(path);
  });

  it('can’t be one’s own to block or delete', async () => {
    const page = await renderUser({ can, isSelf: true });

    await expect.element(page.getByRole('textbox', { name: 'Display name' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Block' })).not.toBeInTheDocument();
    await expect
      .element(page.getByRole('button', { name: 'Delete account' }))
      .not.toBeInTheDocument();
  });
});

describe('a user that is not there', () => {
  it('is not found', async () => {
    vi.mocked(getUserDetailsFn).mockResolvedValue(null);
    const page = await renderPage(path);

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('User not found');
    await expect
      .element(page.getByRole('link', { name: 'All users' }))
      .toHaveAttribute('href', '/users');
  });

  it('is not looked for when their id can’t be one', async () => {
    const page = await renderPage('/users/grace');

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('User not found');
    expect(getUserDetailsFn).not.toHaveBeenCalled();
  });
});
