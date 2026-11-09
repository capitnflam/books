'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { cn } from 'cn';

import { Icon } from './icon';

import type { ComponentProps, FC } from 'react';

const itemClasses =
  "relative flex min-h-11 cursor-default items-center gap-2 rounded-md px-3 py-2 text-base/6 outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-10 data-disabled:pointer-events-none data-disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5";

export type DropdownMenuProps = MenuPrimitive.Root.Props;

export const DropdownMenu: FC<DropdownMenuProps> = ({ ...props }) => {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
};

export type DropdownMenuPortalProps = MenuPrimitive.Portal.Props;

export const DropdownMenuPortal: FC<DropdownMenuPortalProps> = ({ ...props }) => {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
};

export type DropdownMenuTriggerProps = MenuPrimitive.Trigger.Props;

export const DropdownMenuTrigger: FC<DropdownMenuTriggerProps> = ({ ...props }) => {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
};

export type DropdownMenuContentProps = MenuPrimitive.Popup.Props
  & Pick<MenuPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>;

export const DropdownMenuContent: FC<DropdownMenuContentProps> = ({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  ...props
}) => {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'bg-popover text-popover-foreground shadow-page ring-border data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 z-50 max-h-(--available-height) w-(--anchor-width) min-w-48 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md p-1 ring-1 duration-100 outline-none data-closed:overflow-hidden',
            className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
};

export type DropdownMenuGroupProps = MenuPrimitive.Group.Props;

export const DropdownMenuGroup: FC<DropdownMenuGroupProps> = ({ ...props }) => {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
};

export type DropdownMenuLabelProps = MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
};

export const DropdownMenuLabel: FC<DropdownMenuLabelProps> = ({ className, inset, ...props }) => {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn('text-muted-foreground px-3 py-1.5 text-sm data-inset:pl-10', className)}
      {...props}
    />
  );
};

export type DropdownMenuItemProps = MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
};

export const DropdownMenuItem: FC<DropdownMenuItemProps> = ({
  className,
  inset,
  variant = 'default',
  ...props
}) => {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        itemClasses,
        'group/dropdown-menu-item data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-alert-soft data-[variant=destructive]:focus:text-destructive',
        className,
      )}
      {...props}
    />
  );
};

export type DropdownMenuSubProps = MenuPrimitive.SubmenuRoot.Props;

export const DropdownMenuSub: FC<DropdownMenuSubProps> = ({ ...props }) => {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
};

export type DropdownMenuSubTriggerProps = MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
};

export const DropdownMenuSubTrigger: FC<DropdownMenuSubTriggerProps> = ({
  className,
  inset,
  children,
  ...props
}) => {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        itemClasses,
        'data-popup-open:bg-accent data-popup-open:text-accent-foreground',
        className,
      )}
      {...props}
    >
      {children}
      <Icon icon="chevron-right" className="ml-auto" aria-hidden />
    </MenuPrimitive.SubmenuTrigger>
  );
};

export type DropdownMenuSubContentProps = DropdownMenuContentProps;

export const DropdownMenuSubContent: FC<DropdownMenuSubContentProps> = ({
  align = 'start',
  alignOffset = -3,
  side = 'right',
  sideOffset = 0,
  className,
  ...props
}) => {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn('w-auto', className)}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
};

export type DropdownMenuCheckboxItemProps = MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
};

export const DropdownMenuCheckboxItem: FC<DropdownMenuCheckboxItemProps> = ({
  className,
  children,
  checked,
  inset,
  ...props
}) => {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(itemClasses, 'pr-10', className)}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-3 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <Icon icon="check" aria-hidden />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
};

export type DropdownMenuRadioGroupProps = MenuPrimitive.RadioGroup.Props;

export const DropdownMenuRadioGroup: FC<DropdownMenuRadioGroupProps> = ({ ...props }) => {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
};

export type DropdownMenuRadioItemProps = MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
};

export const DropdownMenuRadioItem: FC<DropdownMenuRadioItemProps> = ({
  className,
  children,
  inset,
  ...props
}) => {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(itemClasses, 'pr-10', className)}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-3 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <Icon icon="check" aria-hidden />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
};

export type DropdownMenuSeparatorProps = MenuPrimitive.Separator.Props;

export const DropdownMenuSeparator: FC<DropdownMenuSeparatorProps> = ({ className, ...props }) => {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
};

export type DropdownMenuShortcutProps = ComponentProps<'span'>;

export const DropdownMenuShortcut: FC<DropdownMenuShortcutProps> = ({ className, ...props }) => {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn('text-muted-foreground ml-auto text-sm tracking-widest', className)}
      {...props}
    />
  );
};
