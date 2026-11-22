'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { cn } from 'cn';
import { useRef } from 'react';

import { Button } from './button';
import { Icon } from './icon';

import type { ComponentPropsWithRef, FC } from 'react';

// From shadcn's base-mira combobox, with the Ex Libris theme. Only the multiple-selection parts
// (chips) are here: upstream's single-value `ComboboxInput`, `ComboboxTrigger` and
// `ComboboxClear` build on `input-group`, which this package does not have yet.

/** Generic over the item type, so it stays the Base UI component itself. */
export const Combobox = ComboboxPrimitive.Root;

export type ComboboxValueProps = ComboboxPrimitive.Value.Props;

/** Renders the chosen value: with `multiple`, a function of the chosen items returning chips. */
export const ComboboxValue: FC<ComboboxValueProps> = (props) => {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
};

export type ComboboxContentProps = ComboboxPrimitive.Popup.Props
  & Pick<
    ComboboxPrimitive.Positioner.Props,
    'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'
  >;

export const ComboboxContent: FC<ComboboxContentProps> = ({
  className,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}) => {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            'group/combobox-content bg-popover text-popover-foreground shadow-page ring-border data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-(--anchor-width) origin-(--transform-origin) overflow-hidden rounded-md ring-1 duration-100',
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
};

export type ComboboxListProps = ComboboxPrimitive.List.Props;

export const ComboboxList: FC<ComboboxListProps> = ({ className, ...props }) => {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        'max-h-[min(--spacing(80),var(--available-height))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0',
        className,
      )}
      {...props}
    />
  );
};

export type ComboboxItemProps = ComboboxPrimitive.Item.Props;

export const ComboboxItem: FC<ComboboxItemProps> = ({ className, children, ...props }) => {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex min-h-11 w-full cursor-default items-center gap-2 rounded-md py-2 pr-10 pl-3 text-base/6 outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-3 flex items-center justify-center" />
        }
      >
        <Icon icon="check" aria-hidden />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
};

export type ComboboxEmptyProps = ComboboxPrimitive.Empty.Props;

export const ComboboxEmpty: FC<ComboboxEmptyProps> = ({ className, ...props }) => {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        'text-muted-foreground hidden w-full justify-center px-3 py-3 text-center text-sm group-data-empty/combobox-content:flex',
        className,
      )}
      {...props}
    />
  );
};

export type ComboboxChipsProps = ComponentPropsWithRef<typeof ComboboxPrimitive.Chips>
  & ComboboxPrimitive.Chips.Props;

/** The field holding the chosen items as chips, followed by the text input to find others. */
export const ComboboxChips: FC<ComboboxChipsProps> = ({ className, ...props }) => {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        'border-input bg-card text-foreground hover:border-foreground focus-within:border-ring focus-within:ring-ring focus-within:ring-offset-background has-aria-invalid:border-destructive has-aria-invalid:ring-destructive flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-md border px-1.5 py-1.5 font-serif text-[17px] leading-6 transition-colors focus-within:ring-2 focus-within:ring-offset-2 has-aria-invalid:ring-1',
        className,
      )}
      {...props}
    />
  );
};

export type ComboboxChipProps = ComboboxPrimitive.Chip.Props & {
  /** Accessible name of the button removing the chip, e.g. `Remove Fantasy`. */
  removeLabel?: string;
};

export const ComboboxChip: FC<ComboboxChipProps> = ({
  className,
  children,
  removeLabel,
  ...props
}) => {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        'border-rule bg-background text-foreground flex h-8 w-fit items-center justify-center gap-1 rounded-sm border px-2 text-sm font-medium whitespace-nowrap has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-45 has-data-[slot=combobox-chip-remove]:pr-0.5',
        className,
      )}
      {...props}
    >
      {children}
      {removeLabel && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          aria-label={removeLabel}
          className="text-muted-foreground hover:text-foreground"
          data-slot="combobox-chip-remove"
        >
          <Icon icon="x" aria-hidden />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
};

export type ComboboxChipsInputProps = ComboboxPrimitive.Input.Props;

export const ComboboxChipsInput: FC<ComboboxChipsInputProps> = ({
  className,
  onKeyDown,
  ...props
}) => {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      onKeyDown={(event) => {
        onKeyDown?.(event);

        // Enter picks the highlighted item. With nothing to pick, it would send the form the
        // field is in: in a search box for choosing items, that is never what was meant.
        if (event.key === 'Enter') {
          event.preventDefault();
        }
      }}
      className={cn(
        'placeholder:text-muted-foreground h-8 min-w-24 flex-1 bg-transparent px-1.5 outline-none placeholder:italic',
        className,
      )}
      {...props}
    />
  );
};

/** The element the list opens under: pass it to `ComboboxChips` as `ref` and to `ComboboxContent` as `anchor`. */
export function useComboboxAnchor() {
  return useRef<HTMLDivElement | null>(null);
}
