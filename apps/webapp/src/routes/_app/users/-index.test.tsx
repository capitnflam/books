import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listUsersFn } from '#/services/user-management/user-management.functions';
import { listedUser, pageOf, uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

/** The server lists that many users, `Reader 1` and so on, a page at a time. */
function serverHasUsers(count: number) {
  const users = Array.from({ length: count }, (_, index) =>
    listedUser({ id: uuid(index), displayName: `Reader ${index + 1}` }),
  );

  vi.mocked(listUsersFn).mockImplementation(async ({ data }) => ({
    total: count,
    users: pageOf(users, data.page),
  }));
}

beforeEach(() => signIn(['users:read']));

describe('the list', () => {
  it('shows each user with their role, status and when they joined', async () => {
    vi.mocked(listUsersFn).mockResolvedValue({ total: 1, users: [listedUser()] });
    const page = await renderPage('/users');

    await expect.element(page.getByRole('heading', { name: 'All users (1)' })).toBeVisible();
    await expect
      .element(page.getByRole('row', { name: /Grace Hopper/u }))
      .toHaveTextContent('GHGrace Hoppergrace@example.commoderatorActiveJanuary 15, 2026');
    await expect
      .element(page.getByRole('link', { name: 'Grace Hopper' }))
      .toHaveAttribute('href', `/users/${uuid(71)}`);
    expect(document.title).toBe('Users');
  });

  it.each([
    ['active', 'Active'],
    ['blocked', 'Blocked'],
    ['no-account', 'No account'],
    ['unknown', 'Unknown'],
  ] as const)('names the %s status', async (status, label) => {
    vi.mocked(listUsersFn).mockResolvedValue({ total: 1, users: [listedUser({ status })] });
    const page = await renderPage('/users');

    await expect.element(page.getByRole('cell', { name: label })).toBeVisible();
  });

  it('shows a user without a role', async () => {
    vi.mocked(listUsersFn).mockResolvedValue({ total: 1, users: [listedUser({ role: null })] });
    const page = await renderPage('/users');

    await expect.element(page.getByRole('cell', { name: 'No role' })).toBeVisible();
  });

  it('names users by their email, or not at all, when they have no name', async () => {
    vi.mocked(listUsersFn).mockResolvedValue({
      total: 2,
      users: [
        listedUser({ displayName: null }),
        listedUser({ id: uuid(2), displayName: null, email: '' }),
      ],
    });
    const page = await renderPage('/users');

    await expect.element(page.getByRole('link', { name: 'grace@example.com' })).toBeVisible();
    await expect.element(page.getByRole('link', { name: 'Unnamed user' })).toBeVisible();
  });

  it('says so when there are none', async () => {
    vi.mocked(listUsersFn).mockResolvedValue({ total: 0, users: [] });
    const page = await renderPage('/users');

    await expect.element(page.getByText('No users yet.')).toBeVisible();
  });
});

describe('scrolling', () => {
  it('loads more users, and tells screen readers how many there are', async () => {
    serverHasUsers(60);
    const page = await renderPage('/users');
    const scrollDown = () =>
      page.getByRole('region', { name: 'Users' }).element().scrollTo({ top: 100_000 });

    await expect.element(page.getByText('25 of 60 loaded')).toBeVisible();
    await expect.element(page.getByRole('table')).toHaveAttribute('aria-rowcount', '61');

    scrollDown();
    await expect.element(page.getByText('50 of 60 loaded')).toBeVisible();

    scrollDown();
    await expect.element(page.getByText('60 of 60 loaded')).toBeVisible();

    scrollDown();
    await expect
      .element(page.getByRole('row', { name: /Reader 60/u }))
      .toHaveAttribute('aria-rowindex', '61');
    // Rows out of view are not drawn.
    await expect.element(page.getByRole('link', { name: 'Reader 1' })).not.toBeInTheDocument();
  });

  it('offers to try again when the next users fail to load', async () => {
    serverHasUsers(30);
    const page = await renderPage('/users');

    await expect.element(page.getByText('25 of 30 loaded')).toBeVisible();
    vi.mocked(listUsersFn).mockRejectedValue(new Error('The server is down.'));
    page.getByRole('region', { name: 'Users' }).element().scrollTo({ top: 100_000 });
    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('More entries could not be loaded.');

    serverHasUsers(30);
    await page.getByRole('button', { name: 'Try again' }).click();

    await expect.element(page.getByText('30 of 30 loaded')).toBeVisible();
    await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
  });
});

describe('searching', () => {
  it('finds users and keeps the search in the URL', async () => {
    vi.mocked(listUsersFn).mockResolvedValue({ total: 0, users: [] });
    const page = await renderPage('/users');

    await expect.element(page.getByRole('heading', { name: 'All users (0)' })).toBeVisible();
    vi.mocked(listUsersFn).mockResolvedValue({ total: 1, users: [listedUser()] });

    await page.getByRole('searchbox', { name: 'Search by name' }).fill('grace');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect
      .element(page.getByRole('heading', { name: 'Users matching “grace” (1)' }))
      .toBeVisible();
    expect(page.currentUrl()).toBe('/users?q=grace');
    expect(listUsersFn).toHaveBeenLastCalledWith({ data: { q: 'grace', page: 1 } });
  });

  it('says so when no user matches', async () => {
    vi.mocked(listUsersFn).mockResolvedValue({ total: 0, users: [] });
    const page = await renderPage('/users?q=xyz');

    await expect.element(page.getByText('No user’s name matches “xyz”.')).toBeVisible();
    await expect.element(page.getByRole('searchbox')).toHaveValue('xyz');
  });
});
