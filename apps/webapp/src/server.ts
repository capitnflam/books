import handler from '@tanstack/react-start/server-entry';

import { paraglideMiddleware } from '#/paraglide/server';

// Runs every request inside Paraglide's locale context so SSR renders in the
// locale from the URL. The router rewrite (src/router.tsx) strips the locale
// prefix, so the original request is passed through unchanged. See
// https://github.com/TanStack/router/tree/main/examples/react/start-i18n-paraglide
export default {
  fetch(request: Request): Promise<Response> {
    return paraglideMiddleware(request, () => handler.fetch(request));
  },
};
