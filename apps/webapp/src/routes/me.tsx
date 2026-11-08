import { UserProfile } from '@clerk/tanstack-react-start';
import { createFileRoute } from '@tanstack/react-router';

import { localizeHref } from '#/paraglide/runtime';
import { checkIsAuthenticatedFn } from '#/services/authentication/authentication.functions';

export const Route = createFileRoute('/me')({
  beforeLoad: async ({ location }) => {
    // location.href has the locale prefix stripped by the router rewrite; add it
    // back so signing in returns to the page in the current locale.
    await checkIsAuthenticatedFn({ data: { redirect_url: localizeHref(location.href) } });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <UserProfile />
    </div>
  );
}
