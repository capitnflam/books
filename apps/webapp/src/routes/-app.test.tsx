import { describe, expect, it, vi } from 'vitest';
import { page as browser, userEvent } from 'vitest/browser';

import { setLocale } from '#/paraglide/runtime';
import { listBooksFn } from '#/services/catalog/catalog.functions';
import { getSidebarOpenFn } from '#/services/preferences/preferences.functions';
import { renderPage } from '#/testing/render-page';
import { mockClerk, readIn, signIn } from '#/testing/session';

import type { Permission } from '@books/database';

// The layout around the application pages. `/sample` needs nothing from the server.

type Page = Awaited<ReturnType<typeof renderPage>>;

const navigation = (page: Page) => page.getByRole('navigation', { name: 'Main navigation' });

const navLinks = (page: Page) =>
  navigation(page)
    .getByRole('link')
    .elements()
    .map((link) => link.textContent);

const sidebarState = (page: Page) =>
  page.container.querySelector<HTMLElement>('[data-slot="sidebar"][data-state]')?.dataset.state;

describe('the navigation', () => {
  it('shows only the pages open to everyone when signed out', async () => {
    const page = await renderPage('/sample');

    await expect.element(navigation(page)).toBeVisible();
    expect(navLinks(page)).toEqual(['Home', 'Catalogue', 'Component sample']);
  });

  it.each<[Permission, string]>([
    ['catalog:manage', 'Add a book'],
    ['users:read', 'Users'],
    ['feature-flags:manage', 'Feature flags'],
  ])('also shows the page %s opens', async (permission, name) => {
    signIn([permission]);
    const page = await renderPage('/sample');

    await expect.element(navigation(page).getByRole('link', { name })).toBeVisible();
    expect(navLinks(page)).toHaveLength(4);
  });

  it('marks the closest page as the active one', async () => {
    signIn(['catalog:manage']);
    const page = await renderPage('/books/new');
    const link = (name: string) => navigation(page).getByRole('link', { name });

    await expect.element(link('Add a book')).toHaveAttribute('data-active');
    await expect.element(link('Catalogue')).not.toHaveAttribute('data-active');
    await expect.element(link('Home')).not.toHaveAttribute('data-active');
  });

  it('opens a page without leaving the app', async () => {
    signIn();
    vi.mocked(listBooksFn).mockResolvedValue({ total: 0, books: [] });
    const page = await renderPage('/sample');

    await navigation(page).getByRole('link', { name: 'Catalogue' }).click();

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Catalogue');
    expect(page.currentUrl()).toBe('/books');
  });

  it('is hidden and shown again from the header', async () => {
    const page = await renderPage('/sample');
    const toggle = page
      .getByRole('main')
      .getByRole('button', { name: 'Show or hide the navigation' });

    await toggle.click();
    await expect.poll(() => sidebarState(page)).toBe('collapsed');

    await toggle.click();
    await expect.poll(() => sidebarState(page)).toBe('expanded');
  });

  it('stays hidden when the reader left it so', async () => {
    vi.mocked(getSidebarOpenFn).mockResolvedValue(false);
    const page = await renderPage('/sample');

    await expect.poll(() => sidebarState(page)).toBe('collapsed');
  });

  it('links to the pages in the reader’s language', async () => {
    readIn('fr');
    const page = await renderPage('/fr/sample');

    await expect
      .element(page.getByRole('link', { name: 'Catalogue' }))
      .toHaveAttribute('href', '/fr/books');
  });
});

describe('the theme menu', () => {
  it('switches the theme and remembers it', async () => {
    const page = await renderPage('/sample');

    await page.getByRole('button', { name: 'Appearance: Light' }).click();
    await browser.getByRole('menuitemradio', { name: 'Dark' }).click();

    await expect
      .element(page.getByRole('button', { name: 'Appearance: Dark' }))
      .toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');
    expect(document.cookie).toContain('theme=dark');
  });
});

describe('the user menu', () => {
  it('offers to sign in when signed out', async () => {
    const page = await renderPage('/sample');

    await expect.element(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  it('leads to the profile', async () => {
    signIn();
    const page = await renderPage('/sample');

    await page.getByRole('button', { name: 'Ada Lovelace', exact: false }).click();

    await expect
      .element(browser.getByRole('menuitem', { name: 'Profile' }))
      .toHaveAttribute('href', '/me');
  });

  it('switches the language', async () => {
    signIn();
    const page = await renderPage('/sample');

    await page.getByRole('button', { name: 'Ada Lovelace', exact: false }).click();
    // By keyboard: the pointer opens submenus on hover, after a delay.
    await userEvent.type(browser.getByRole('menuitem', { name: 'Language' }), '{ArrowRight}');
    await userEvent.type(browser.getByRole('menuitemradio', { name: 'Deutsch' }), '{Enter}');

    expect(setLocale).toHaveBeenCalledWith('de');
  });

  it('signs out, back to the home page', async () => {
    signIn();
    const clerk = mockClerk();
    const page = await renderPage('/sample');

    await page.getByRole('button', { name: 'Ada Lovelace', exact: false }).click();
    await browser.getByRole('menuitem', { name: 'Sign out' }).click();

    expect(clerk.signOut).toHaveBeenCalledWith({ redirectUrl: '/' });
  });
});
