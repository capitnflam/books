import { createFileRoute } from '@tanstack/react-router';

import { localizeHref } from '#/paraglide/runtime';
import { checkPermissionFn } from '#/services/access/access.functions';

// Guards every feature flag page. The server functions the pages call check the permission
// again on their own.
export const Route = createFileRoute('/_app/feature-flags')({
  beforeLoad: async ({ location }) => {
    // location.href has the locale prefix stripped by the router rewrite; add it back so
    // signing in returns to the page in the current locale.
    await checkPermissionFn({
      data: { permission: 'feature-flags:manage', redirect_url: localizeHref(location.href) },
    });
  },
});
