import { HeadContent, RouterProvider, createMemoryHistory } from '@tanstack/react-router';
import { render } from 'vitest-browser-react';

import { ThemeProvider } from '#/components/ThemeProvider';
import AppClerkProvider from '#/integrations/clerk/provider';
import { getRouter } from '#/router';
import { Route as RootRoute } from '#/routes/__root';

import type { ReactNode } from 'react';
import type { RenderResult } from 'vitest-browser-react';

/** The root document's content, without the `<html>` the test page already has. */
function TestShell({ children }: { children: ReactNode }) {
  const { theme } = RootRoute.useLoaderData();

  return (
    <ThemeProvider initialTheme={theme}>
      <HeadContent />
      <AppClerkProvider>{children}</AppClerkProvider>
    </ThemeProvider>
  );
}

type RenderedPage = RenderResult & {
  /** The path and query the app is at now. */
  currentUrl: () => string;
};

/**
 * Opens the app at `path`, through its real routes: guards, loaders, layout and page. Say who
 * is signed in and what the server functions answer first.
 */
export async function renderPage(path: string): Promise<RenderedPage> {
  Object.assign(RootRoute.options, { shellComponent: TestShell });

  const router = getRouter();

  router.update({
    ...router.options,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  // A failed query fails at once rather than after three more tries.
  router.options.context.queryClient.setDefaultOptions({ queries: { retry: false } });

  const screen = await render(<RouterProvider router={router} />);

  return { ...screen, currentUrl: () => router.state.location.href };
}
