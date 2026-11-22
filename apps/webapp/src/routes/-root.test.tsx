import { expect, it, vi } from 'vitest';

import { getThemeFn } from '#/services/preferences/preferences.functions';
import { renderPage } from '#/testing/render-page';
import { readIn } from '#/testing/session';

it('says so when there is no such page', async () => {
  const page = await renderPage('/no-such-page');

  await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('404');
  await expect.element(page.getByText('The requested page could not be found.')).toBeVisible();
});

it('marks the document with the page’s language', async () => {
  readIn('fr');
  const page = await renderPage('/sign-in');

  await expect.element(page.getByText('Clerk sign-in form')).toBeVisible();
  expect(document.documentElement.lang).toBe('fr');
});

it.each([
  ['dark', true],
  ['light', false],
] as const)('shows the pages in the %s theme the reader chose', async (theme, isDark) => {
  vi.mocked(getThemeFn).mockResolvedValue(theme);
  const page = await renderPage('/sign-in');

  await expect.element(page.getByText('Clerk sign-in form')).toBeVisible();
  expect(document.documentElement.classList.contains('dark')).toBe(isDark);
});

it('signs up with Clerk', async () => {
  const page = await renderPage('/sign-up');

  await expect.element(page.getByText('Clerk sign-up form')).toBeVisible();
});

it('leaves the steps of a sign-in to Clerk', async () => {
  const page = await renderPage('/sign-in/factor-one');

  await expect.element(page.getByText('Clerk sign-in form')).toBeVisible();
});
