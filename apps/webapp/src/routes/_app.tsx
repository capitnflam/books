import { SidebarInset, SidebarProvider, SidebarTrigger } from '@books/ui/components/sidebar';
import { Outlet, createFileRoute } from '@tanstack/react-router';

import AppSidebar from '#/components/AppSidebar';
import ThemeMenu from '#/components/ThemeMenu';
import { m } from '#/paraglide/messages';
import { getSidebarOpenFn } from '#/services/preferences/preferences.functions';

// Layout of the application pages: the navigation sidebar beside the page content.
export const Route = createFileRoute('/_app')({
  loader: async () => ({ sidebarOpen: await getSidebarOpenFn() }),
  // The sidebar state only changes on the client, which writes it to the cookie itself.
  staleTime: Infinity,
  component: AppLayout,
});

function AppLayout() {
  const { sidebarOpen } = Route.useLoaderData();

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="border-border bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger label={m.nav_toggle()} />
          <div className="ml-auto">
            <ThemeMenu />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
