import { createFileRoute } from '@tanstack/react-router';

import { localizeHref } from '#/paraglide/runtime';
import { checkIsAuthenticatedFn } from '#/services/authentication/authentication.functions';

// Guards every catalogue page: any signed-in reader gets in, and the pages that change the
// catalogue check the permission too. The server functions they call check again on their own.
export const Route = createFileRoute('/_app/books')({
  beforeLoad: async ({ location }) => {
    // location.href has the locale prefix stripped by the router rewrite; add it back so
    // signing in returns to the page in the current locale.
    await checkIsAuthenticatedFn({ data: { redirect_url: localizeHref(location.href) } });
  },
});
