import appCss from '@books/ui/globals.css?url';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { SystemThemeScript, ThemeProvider, themeClassName } from '#/components/ThemeProvider';
import ClerkProvider from '#/integrations/clerk/provider';
import TanStackQueryDevtools from '#/integrations/tanstack-query/devtools';
import { getLocale } from '#/paraglide/runtime';
import { getThemeFn } from '#/services/preferences/preferences.functions';
import { seo } from '#/utils/seo';

import type { QueryClient } from '@tanstack/react-query';

export interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale());
    }
  },
  loader: async () => ({ theme: await getThemeFn() }),
  // The theme only changes on the client, which writes the cookie and updates `<html>` itself.
  staleTime: Infinity,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
      ...seo({
        title: 'Books',
        description: 'Library management application',
        url: 'https://books.flaminc.networks',
        image: '/logo512.png',
      }),
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      { rel: 'manifest', href: '/manifest.json', color: '#f6efe2' },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = Route.useLoaderData();

  return (
    // The theme script and `ThemeProvider` change `class` on the client.
    <html lang={getLocale()} className={themeClassName(theme)} suppressHydrationWarning>
      <head>
        <SystemThemeScript theme={theme} />
        <HeadContent />
      </head>
      <body>
        <ThemeProvider initialTheme={theme}>
          <ClerkProvider>
            {children}
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
                TanStackQueryDevtools,
              ]}
            />
          </ClerkProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
