import { Icon } from '@books/ui/components/icon';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@books/ui/components/sidebar';
import { Link, useMatchRoute } from '@tanstack/react-router';

import UserMenu from '#/integrations/clerk/user-menu';
import { m } from '#/paraglide/messages';

import type { IconName } from '@books/ui/components/icon';
import type { LinkProps } from '@tanstack/react-router';

type NavItem = {
  to: NonNullable<LinkProps['to']>;
  icon: IconName;
  label: () => string;
};

const libraryItems: NavItem[] = [
  { to: '/', icon: 'home', label: m.nav_home },
  { to: '/sample', icon: 'components', label: m.sample_page_title },
];

export default function AppSidebar() {
  const matchRoute = useMatchRoute();
  const { setOpenMobile } = useSidebar();
  // On mobile the sidebar is a sheet over the page: close it once a page is chosen.
  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="icon" mobileTitle={m.nav_label()} mobileDescription={m.nav_description()}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Books"
              render={<Link to="/" onClick={closeMobile} />}
            >
              <Icon icon="books" className="text-primary size-6!" aria-hidden />
              <span className="font-heading text-[22px]/7 font-semibold">Books</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label={m.nav_label()}>
          <SidebarGroup>
            <SidebarGroupLabel>{m.nav_group_library()}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {libraryItems.map(({ to, icon, label }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      isActive={!!matchRoute({ to })}
                      tooltip={label()}
                      render={<Link to={to} onClick={closeMobile} />}
                    >
                      <Icon icon={icon} aria-hidden />
                      <span>{label()}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail label={m.nav_toggle()} />
    </Sidebar>
  );
}
