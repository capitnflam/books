import { expect, it } from 'vitest';

import { renderPage } from '#/testing/render-page';
import { signIn } from '#/testing/session';

it('explains that the page is off limits and leads back home', async () => {
  signIn();
  const page = await renderPage('/forbidden');

  await expect
    .element(page.getByRole('heading', { level: 1 }))
    .toHaveTextContent('You don’t have access to this page');
  await expect.element(page.getByText('Back to the home page')).toHaveAttribute('href', '/');
  expect(document.title).toBe('You don’t have access to this page');
});
