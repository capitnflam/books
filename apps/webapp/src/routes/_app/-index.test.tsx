import { expect, it, vi } from 'vitest';

import { getAuthenticatedUserFn } from '#/services/users/users.functions';
import { profile } from '#/testing/fixtures';
import { renderPage } from '#/testing/render-page';
import { readIn, signIn } from '#/testing/session';

const { user } = profile();

it('welcomes a guest and offers to sign in', async () => {
  vi.mocked(getAuthenticatedUserFn).mockResolvedValue(null);
  const page = await renderPage('/');

  await expect
    .element(page.getByRole('heading', { level: 1 }))
    .toHaveTextContent('Welcome to the reading room');
  await expect.element(page.getByText('Sign in to open your catalogue.')).toBeVisible();
  await expect
    .element(page.getByRole('main').getByRole('button', { name: 'Sign in' }))
    .toBeVisible();
  expect(document.title).toBe('Home');
});

it('welcomes a reader by name', async () => {
  signIn();
  vi.mocked(getAuthenticatedUserFn).mockResolvedValue(user);
  const page = await renderPage('/');

  await expect
    .element(page.getByRole('heading', { level: 1 }))
    .toHaveTextContent('Welcome, Countess Lovelace');
  await expect.element(page.getByText('Sign in to open your catalogue.')).not.toBeInTheDocument();
});

it('welcomes a reader without a name, and does not offer to sign in again', async () => {
  signIn();
  vi.mocked(getAuthenticatedUserFn).mockResolvedValue({ ...user, displayName: '' });
  const page = await renderPage('/');

  await expect
    .element(page.getByRole('heading', { level: 1 }))
    .toHaveTextContent('Welcome to the reading room');
  await expect.element(page.getByText('Sign in to open your catalogue.')).not.toBeInTheDocument();
});

it('welcomes a reader in their language', async () => {
  signIn();
  readIn('fr');
  vi.mocked(getAuthenticatedUserFn).mockResolvedValue(user);
  const page = await renderPage('/fr');

  await expect
    .element(page.getByRole('heading', { level: 1 }))
    .toHaveTextContent('Bienvenue, Countess Lovelace');
});
