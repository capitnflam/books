'use client';

import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { cn } from 'cn';

import { IconButton } from './icon-button';

import type { ComponentProps, FC } from 'react';

export type SheetProps = SheetPrimitive.Root.Props;

export const Sheet: FC<SheetProps> = ({ ...props }) => {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
};

export type SheetTriggerProps = SheetPrimitive.Trigger.Props;

export const SheetTrigger: FC<SheetTriggerProps> = ({ ...props }) => {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
};

export type SheetCloseProps = SheetPrimitive.Close.Props;

export const SheetClose: FC<SheetCloseProps> = ({ ...props }) => {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
};

type SheetPortalProps = SheetPrimitive.Portal.Props;

const SheetPortal: FC<SheetPortalProps> = ({ ...props }) => {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
};

type SheetOverlayProps = SheetPrimitive.Backdrop.Props;

const SheetOverlay: FC<SheetOverlayProps> = ({ className, ...props }) => {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        // Ink by day, dark wood at night: the overlay darkens the page in both themes.
        'bg-ink/40 dark:bg-parchment/70 fixed inset-0 z-50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs',
        className,
      )}
      {...props}
    />
  );
};

export type SheetContentProps = SheetPrimitive.Popup.Props & {
  side?: 'top' | 'right' | 'bottom' | 'left';
  showCloseButton?: boolean;
  /** Accessible name of the close button. */
  closeLabel?: string;
};

export const SheetContent: FC<SheetContentProps> = ({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  closeLabel = 'Close',
  ...props
}) => {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          'bg-popover text-popover-foreground shadow-page border-border fixed z-50 flex flex-col bg-clip-padding text-base/6 transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <IconButton
                icon="x"
                label={closeLabel}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4"
              />
            }
          />
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
};

export type SheetHeaderProps = ComponentProps<'div'>;

export const SheetHeader: FC<SheetHeaderProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-6', className)}
      {...props}
    />
  );
};

export type SheetFooterProps = ComponentProps<'div'>;

export const SheetFooter: FC<SheetFooterProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-6', className)}
      {...props}
    />
  );
};

export type SheetTitleProps = SheetPrimitive.Title.Props;

export const SheetTitle: FC<SheetTitleProps> = ({ className, ...props }) => {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('font-heading text-foreground text-[22px]/7 font-semibold', className)}
      {...props}
    />
  );
};

export type SheetDescriptionProps = SheetPrimitive.Description.Props;

export const SheetDescription: FC<SheetDescriptionProps> = ({ className, ...props }) => {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-muted-foreground text-base/6', className)}
      {...props}
    />
  );
};
