'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { useIsMobile } from '@books/ui/hooks/use-mobile';
import { cva } from 'class-variance-authority';
import { cn } from 'cn';
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from 'react';

import { IconButton } from './icon-button';
import { Input } from './input';
import { Separator } from './separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './sheet';
import { Skeleton } from './skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

import type { IconButtonProps } from './icon-button';
import type { InputProps } from './input';
import type { SeparatorProps } from './separator';
import type { TooltipContentProps } from './tooltip';
import type { ComponentProps, CSSProperties, FC } from 'react';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
// A 44px menu button plus the group's 8px padding on each side.
const SIDEBAR_WIDTH_ICON = '3.75rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

const focusRing =
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar';

type SidebarContextProps = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

export const useSidebar = (): SidebarContextProps => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
};

export type SidebarProviderProps = ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const SidebarProvider: FC<SidebarProviderProps> = ({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        setInternalOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = useCallback(() => {
    return isMobile ? setOpenMobile((value) => !value) : setOpen((value) => !value);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? 'expanded' : 'collapsed';

  const contextValue = useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
            ...style,
          } as CSSProperties
        }
        className={cn(
          'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

export type SidebarProps = ComponentProps<'div'> & {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  /** Accessible title of the sheet the sidebar opens in on mobile. */
  mobileTitle?: string;
  /** Accessible description of the sheet the sidebar opens in on mobile. */
  mobileDescription?: string;
};

export const Sidebar: FC<SidebarProps> = ({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  mobileTitle = 'Sidebar',
  mobileDescription = 'Displays the mobile sidebar.',
  className,
  children,
  dir,
  ...props
}) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0"
          showCloseButton={false}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{mobileTitle}</SheetTitle>
            <SheetDescription>{mobileDescription}</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex',
          // Adjust the padding for floating and inset variants.
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
            : 'border-sidebar-border group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:shadow-page group-data-[variant=floating]:ring-sidebar-border flex size-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:ring-1"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export type SidebarTriggerProps = Omit<IconButtonProps, 'icon' | 'label'> & {
  /** Accessible name of the button. */
  label?: string;
};

export const SidebarTrigger: FC<SidebarTriggerProps> = ({
  className,
  onClick,
  label = 'Toggle sidebar',
  ...props
}) => {
  const { toggleSidebar } = useSidebar();

  return (
    <IconButton
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="sm"
      icon="layout-sidebar"
      label={label}
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    />
  );
};

export type SidebarRailProps = ComponentProps<'button'> & {
  /** Accessible name of the rail. */
  label?: string;
};

export const SidebarRail: FC<SidebarRailProps> = ({
  className,
  label = 'Toggle sidebar',
  ...props
}) => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label={label}
      tabIndex={-1}
      onClick={toggleSidebar}
      title={label}
      className={cn(
        'hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2',
        'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
        '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
        '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        className,
      )}
      {...props}
    />
  );
};

export type SidebarInsetProps = ComponentProps<'main'>;

export const SidebarInset: FC<SidebarInsetProps> = ({ className, ...props }) => {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'bg-background md:peer-data-[variant=inset]:shadow-page relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-lg md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className,
      )}
      {...props}
    />
  );
};

export type SidebarInputProps = InputProps;

export const SidebarInput: FC<SidebarInputProps> = ({ className, ...props }) => {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn('bg-background focus-visible:ring-offset-sidebar w-full', className)}
      {...props}
    />
  );
};

export type SidebarHeaderProps = ComponentProps<'div'>;

export const SidebarHeader: FC<SidebarHeaderProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
};

export type SidebarFooterProps = ComponentProps<'div'>;

export const SidebarFooter: FC<SidebarFooterProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
};

export type SidebarSeparatorProps = SeparatorProps;

export const SidebarSeparator: FC<SidebarSeparatorProps> = ({ className, ...props }) => {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn('bg-sidebar-border mx-2 w-auto', className)}
      {...props}
    />
  );
};

export type SidebarContentProps = ComponentProps<'div'>;

export const SidebarContent: FC<SidebarContentProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        'no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      {...props}
    />
  );
};

export type SidebarGroupProps = ComponentProps<'div'>;

export const SidebarGroup: FC<SidebarGroupProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col px-2 py-1', className)}
      {...props}
    />
  );
};

export type SidebarGroupLabelProps = useRender.ComponentProps<'div'> & ComponentProps<'div'>;

export const SidebarGroupLabel: FC<SidebarGroupLabelProps> = ({ className, render, ...props }) => {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          // The overline style (spaced capitals of a shelf label), at the minimum UI text size.
          'text-muted-foreground flex h-8 shrink-0 items-center rounded-md px-2 text-sm font-medium tracking-[0.08em] uppercase transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 [&>svg]:size-4 [&>svg]:shrink-0',
          focusRing,
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: 'sidebar-group-label',
      sidebar: 'group-label',
    },
  });
};

export type SidebarGroupActionProps = useRender.ComponentProps<'button'> & ComponentProps<'button'>;

export const SidebarGroupAction: FC<SidebarGroupActionProps> = ({
  className,
  render,
  ...props
}) => {
  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      {
        className: cn(
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-1 right-3 flex aspect-square w-6 items-center justify-center rounded-md p-0 transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0',
          focusRing,
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: 'sidebar-group-action',
      sidebar: 'group-action',
    },
  });
};

export type SidebarGroupContentProps = ComponentProps<'div'>;

export const SidebarGroupContent: FC<SidebarGroupContentProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn('w-full text-base/6', className)}
      {...props}
    />
  );
};

export type SidebarMenuProps = ComponentProps<'ul'>;

export const SidebarMenu: FC<SidebarMenuProps> = ({ className, ...props }) => {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-px', className)}
      {...props}
    />
  );
};

export type SidebarMenuItemProps = ComponentProps<'li'>;

export const SidebarMenuItem: FC<SidebarMenuItemProps> = ({ className, ...props }) => {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  );
};

type SidebarMenuButtonVariant = 'default' | 'outline';
type SidebarMenuButtonSize = 'default' | 'sm' | 'lg';

const sidebarMenuButtonVariants = cva<{
  variant: Record<SidebarMenuButtonVariant, string>;
  size: Record<SidebarMenuButtonSize, string>;
}>(
  // Burgundy marks the active page; hovering only tints the background.
  'peer/menu-button group/menu-button text-sidebar-foreground hover:bg-sidebar-accent/60 active:bg-sidebar-accent data-open:hover:bg-sidebar-accent data-active:bg-sidebar-accent data-active:text-sidebar-primary flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left font-medium transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-11 group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:p-[13px]! disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 data-active:font-semibold [&_svg]:size-4.5 [&_svg]:shrink-0 [&>span:last-child]:truncate',
  {
    variants: {
      variant: {
        default: '',
        outline: 'bg-background shadow-[0_0_0_1px_var(--sidebar-border)]',
      },
      size: {
        default: 'h-11 px-3 text-base/6',
        sm: 'h-8 text-sm',
        lg: 'h-12 text-base/6 group-data-[collapsible=icon]:p-1.5!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type SidebarMenuButtonProps = useRender.ComponentProps<'button'>
  & ComponentProps<'button'> & {
    isActive?: boolean;
    /** Shown beside the button when the sidebar is collapsed to icons. */
    tooltip?: string | TooltipContentProps;
    variant?: SidebarMenuButtonVariant;
    size?: SidebarMenuButtonSize;
  };

export const SidebarMenuButton: FC<SidebarMenuButtonProps> = ({
  render,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}) => {
  const { isMobile, state } = useSidebar();
  const comp = useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      {
        className: cn(sidebarMenuButtonVariants({ variant, size }), focusRing, className),
      },
      props,
    ),
    render: tooltip ? <TooltipTrigger render={render} /> : render,
    state: {
      slot: 'sidebar-menu-button',
      sidebar: 'menu-button',
      size,
      active: isActive,
    },
  });

  if (!tooltip) {
    return comp;
  }

  const tooltipProps = typeof tooltip === 'string' ? { children: tooltip } : tooltip;

  // Disable the tooltip rather than hide it: a hidden tooltip still opens on focus and
  // swallows the first Escape meant for the mobile sheet.
  return (
    <Tooltip disabled={state !== 'collapsed' || isMobile}>
      {comp}
      <TooltipContent side="right" align="center" {...tooltipProps} />
    </Tooltip>
  );
};

export type SidebarMenuActionProps = useRender.ComponentProps<'button'>
  & ComponentProps<'button'> & {
    showOnHover?: boolean;
  };

export const SidebarMenuAction: FC<SidebarMenuActionProps> = ({
  className,
  render,
  showOnHover = false,
  ...props
}) => {
  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      {
        className: cn(
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-1.5 right-1.5 flex aspect-square w-8 items-center justify-center rounded-md p-0 transition-transform group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2 peer-data-[size=sm]/menu-button:top-0 after:absolute after:-inset-2 md:after:hidden [&>svg]:size-4.5 [&>svg]:shrink-0',
          focusRing,
          showOnHover
            && 'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 aria-expanded:opacity-100 md:opacity-0',
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: 'sidebar-menu-action',
      sidebar: 'menu-action',
    },
  });
};

export type SidebarMenuBadgeProps = ComponentProps<'div'>;

export const SidebarMenuBadge: FC<SidebarMenuBadgeProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        'text-sidebar-foreground peer-data-active/menu-button:text-sidebar-primary pointer-events-none absolute right-1.5 flex h-6 min-w-6 items-center justify-center rounded-sm px-1 text-sm font-medium tabular-nums select-none group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-2.5 peer-data-[size=lg]/menu-button:top-3 peer-data-[size=sm]/menu-button:top-1',
        className,
      )}
      {...props}
    />
  );
};

export type SidebarMenuSkeletonProps = ComponentProps<'div'> & {
  showIcon?: boolean;
};

export const SidebarMenuSkeleton: FC<SidebarMenuSkeletonProps> = ({
  className,
  showIcon = false,
  ...props
}) => {
  // A width between 50 and 90%, varied per skeleton but derived from useId rather than
  // Math.random, so the server and the client render the same value.
  const id = useId();
  const width = `${([...id].reduce((sum, char) => sum + char.codePointAt(0)!, 0) % 40) + 50}%`;

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn('flex h-11 items-center gap-2 rounded-md px-3', className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4.5 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as CSSProperties
        }
      />
    </div>
  );
};

export type SidebarMenuSubProps = ComponentProps<'ul'>;

export const SidebarMenuSub: FC<SidebarMenuSubProps> = ({ className, ...props }) => {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        'border-sidebar-border mx-5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5 group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
};

export type SidebarMenuSubItemProps = ComponentProps<'li'>;

export const SidebarMenuSubItem: FC<SidebarMenuSubItemProps> = ({ className, ...props }) => {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn('group/menu-sub-item relative', className)}
      {...props}
    />
  );
};

export type SidebarMenuSubButtonProps = useRender.ComponentProps<'a'>
  & ComponentProps<'a'> & {
    size?: 'sm' | 'md';
    isActive?: boolean;
  };

export const SidebarMenuSubButton: FC<SidebarMenuSubButtonProps> = ({
  render,
  size = 'md',
  isActive = false,
  className,
  ...props
}) => {
  return useRender({
    defaultTagName: 'a',
    props: mergeProps<'a'>(
      {
        className: cn(
          'text-sidebar-foreground hover:bg-sidebar-accent/60 active:bg-sidebar-accent data-active:bg-sidebar-accent data-active:text-sidebar-primary flex min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 no-underline group-data-[collapsible=icon]:hidden disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 data-active:font-semibold data-[size=md]:h-11 data-[size=md]:text-base/6 data-[size=sm]:h-8 data-[size=sm]:text-sm [&>span:last-child]:truncate [&>svg]:size-4.5 [&>svg]:shrink-0',
          focusRing,
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: 'sidebar-menu-sub-button',
      sidebar: 'menu-sub-button',
      size,
      active: isActive,
    },
  });
};
