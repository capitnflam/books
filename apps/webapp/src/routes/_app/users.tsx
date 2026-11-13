import { createFileRoute } from '@tanstack/react-router';

import { localizeHref } from '#/paraglide/runtime';
import { checkPermissionFn } from '#/services/access/access.functions';

// Guards every user management page: only users who may see the user list get in.
// The server functions the pages call check permissions again on their own.
export const Route = createFileRoute('/_app/users')({
  beforeLoad: async ({ location }) => {
    // location.href has the locale prefix stripped by the router rewrite; add it back so
    // signing in returns to the page in the current locale.
    await checkPermissionFn({
      data: { permission: 'users:read', redirect_url: localizeHref(location.href) },
    });
  },
});
