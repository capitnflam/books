import { expect, waitFor, within } from 'storybook/test';

import { Avatar, AvatarFallback } from '#/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/dropdown-menu';
import { Icon } from '#/components/icon';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '#/components/sidebar';

import type { IconName } from '#/components/icon';
import type { SidebarProps } from '#/components/sidebar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FC } from 'react';

type NavItem = { label: string; icon: IconName; badge?: number };

const catalogue: NavItem[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Books', icon: 'library', badge: 128 },
  { label: 'Authors', icon: 'feather' },
  { label: 'Loans', icon: 'bookmark', badge: 3 },
];

const UserMenu: FC = () => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={
        <SidebarMenuButton
          size="lg"
          tooltip="Account"
          className="data-popup-open:bg-sidebar-accent"
        />
      }
    >
      <Avatar>
        <AvatarFallback>EH</AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col">
        <span className="truncate">Éloïse Hugo</span>
        <span className="text-muted-foreground truncate text-sm font-normal">
          eloise@example.com
        </span>
      </span>
      <Icon icon="selector" className="ml-auto" aria-hidden />
    </DropdownMenuTrigger>
    <DropdownMenuContent side="top" className="min-w-56">
      <DropdownMenuItem>
        <Icon icon="user" aria-hidden />
        Profile
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Icon icon="logout" aria-hidden />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const AppSidebar: FC<Pick<SidebarProps, 'collapsible' | 'variant'> & { loading?: boolean }> = ({
  loading,
  ...props
}) => (
  <Sidebar {...props}>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" render={<a href="#home" />} tooltip="Ex Libris">
            <Icon icon="books" className="text-primary" aria-hidden />
            <span className="font-heading text-[22px]/7 font-semibold">Ex Libris</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Catalogue</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {loading
              ? catalogue.map(({ label }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))
              : catalogue.map(({ label, icon, badge }, index) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      isActive={index === 0}
                      tooltip={label}
                      render={
                        <a
                          href={`#${label.toLowerCase()}`}
                          aria-current={index === 0 ? 'page' : undefined}
                        />
                      }
                    >
                      <Icon icon={icon} aria-hidden />
                      <span>{label}</span>
                    </SidebarMenuButton>
                    {badge !== undefined && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <UserMenu />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
);

type SidebarStoryArgs = Pick<SidebarProps, 'collapsible' | 'variant'> & { loading?: boolean };

const meta: Meta<SidebarStoryArgs> = {
  title: 'Components/Sidebar',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: { collapsible: 'icon', variant: 'sidebar', loading: false },
  argTypes: {
    collapsible: {
      options: ['offcanvas', 'icon', 'none'],
      control: { type: 'radio' },
    },
    variant: {
      options: ['sidebar', 'floating', 'inset'],
      control: { type: 'radio' },
    },
  },
  render: (args) => (
    <SidebarProvider>
      <AppSidebar {...args} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 px-4">
          <SidebarTrigger />
          <h1 className="text-heading-3 font-heading">Home</h1>
        </header>
        <p className="px-4">The reading room is open.</p>
      </SidebarInset>
    </SidebarProvider>
  ),
};

export default meta;
type Story = StoryObj<SidebarStoryArgs>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    // The rail beside the sidebar has the same name; the trigger is the one in the header.
    const getTrigger = () => canvas.getAllByRole('button', { name: 'Toggle sidebar' })[0]!;
    const sidebar = canvasElement.querySelector('[data-slot=sidebar]');
    const home = canvas.getByRole('link', { name: 'Home' });

    await expect(home).toHaveAttribute('data-active');
    await expect(home).toHaveAttribute('aria-current', 'page');
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    // The trigger collapses the sidebar to its icons, and the labels move to tooltips.
    await userEvent.click(getTrigger());
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    await expect(sidebar).toHaveAttribute('data-collapsible', 'icon');

    // The tooltip is portalled to the document body, outside the story canvas.
    await userEvent.hover(canvas.getByRole('link', { name: 'Books' }));
    await waitFor(() =>
      expect(
        canvasElement.ownerDocument.querySelector('[data-slot=tooltip-content]'),
      ).toHaveTextContent('Books'),
    );

    await userEvent.click(getTrigger());
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  },
};

export const UserMenuOpen: Story = {
  name: 'User Menu',
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: /Éloïse Hugo/u }));
    await waitFor(() => expect(body.getByRole('menu')).toBeVisible());
    await expect(body.getByRole('menuitem', { name: 'Sign out' })).toBeVisible();
  },
};

export const Floating: Story = {
  args: { variant: 'floating' },
};

export const Inset: Story = {
  args: { variant: 'inset' },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('link', { name: 'Books' })).not.toBeInTheDocument();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const getTrigger = () => canvas.getByRole('button', { name: 'Toggle sidebar' });
    const body = within(canvasElement.ownerDocument.body);

    // On a narrow screen the sidebar is hidden until the trigger opens it in a sheet.
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(getTrigger());

    const dialog = await body.findByRole('dialog', { name: 'Sidebar' });
    await waitFor(() => expect(within(dialog).getByRole('link', { name: 'Books' })).toBeVisible());

    // Focus moves into the sheet once it opens; Escape then closes it.
    await waitFor(() =>
      expect(dialog).toContainElement(canvasElement.ownerDocument.activeElement as HTMLElement),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};
