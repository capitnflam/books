import { describe, expect, it, vi } from 'vitest';

import { listBooksFn } from '#/services/catalog/catalog.functions';
import { listUsersFn } from '#/services/user-management/user-management.functions';
import { uuid } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

import type { Permission } from '@books/database';

const readerPages = ['/me', '/books', `/books/${uuid(1)}`];

const restrictedPages: [path: string, permission: Permission][] = [
  ['/books/new', 'catalog:manage'],
  [`/books/${uuid(1)}/edit`, 'catalog:manage'],
  [`/books/${uuid(1)}/editions/new`, 'catalog:manage'],
  [`/books/${uuid(1)}/editions/${uuid(10)}/edit`, 'catalog:manage'],
  ['/catalog-index', 'catalog:manage'],
  ['/users', 'users:read'],
  [`/users/${uuid(71)}`, 'users:read'],
  ['/feature-flags', 'feature-flags:manage'],
  [`/feature-flags/${uuid(60)}`, 'feature-flags:manage'],
];

const permissions: Permission[] = [
  'collection:manage',
  'catalog:manage',
  'users:read',
  'users:manage',
  'roles:manage',
  'user-roles:manage',
  'feature-flags:manage',
];

describe('signed out', () => {
  it.each([...readerPages, ...restrictedPages.map(([path]) => path)])(
    'sends %s to the sign-in page, to come back once signed in',
    async (path) => {
      const page = await renderPage(path);

      await expect.element(page.getByText('Clerk sign-in form')).toBeVisible();
      expect(page.currentUrl()).toBe(`/sign-in?redirect_url=${encodeURIComponent(path)}`);
    },
  );

  it('keeps the search of the page to come back to', async () => {
    const page = await renderPage('/books?q=hobbit');

    await expect.element(page.getByText('Clerk sign-in form')).toBeVisible();
    expect(page.currentUrl()).toBe(
      `/sign-in?redirect_url=${encodeURIComponent('/books?q=hobbit')}`,
    );
  });

  it('loads nothing the page would show', async () => {
    const page = await renderPage('/books');

    await expect.element(page.getByText('Clerk sign-in form')).toBeVisible();
    expect(listBooksFn).not.toHaveBeenCalled();
  });
});

describe('signed in without the permission', () => {
  it.each(restrictedPages)('turns the reader away from %s', async (path, needed) => {
    signIn(permissions.filter((permission) => permission !== needed));
    const page = await renderPage(path);

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('You don’t have access to this page');
    expect(page.currentUrl()).toBe('/forbidden');
  });
});

it('lets a reader with the permission in', async () => {
  signIn(['users:read']);
  vi.mocked(listUsersFn).mockResolvedValue({ total: 0, users: [] });
  const page = await renderPage('/users');

  await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Users');
});
