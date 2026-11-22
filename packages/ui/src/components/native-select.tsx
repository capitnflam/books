import { cn } from 'cn';

import { Icon } from './icon';

import type { ComponentProps, FC } from 'react';

export type NativeSelectProps = Omit<ComponentProps<'select'>, 'size'> & {
  size?: 'sm' | 'default';
};

export const NativeSelect: FC<NativeSelectProps> = ({ className, size = 'default', ...props }) => {
  return (
    <div
      className={cn(
        'group/native-select relative w-fit has-[select:disabled]:opacity-45',
        className,
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="border-input bg-card text-foreground hover:not-disabled:border-foreground focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive h-11 w-full min-w-0 cursor-pointer appearance-none rounded-md border py-1 pr-10 pl-3 font-serif text-[17px] leading-6 transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-dashed aria-invalid:ring-1 data-[size=sm]:h-8 data-[size=sm]:pr-8 data-[size=sm]:text-sm"
        {...props}
      />
      <Icon
        icon="selector"
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4.5 -translate-y-1/2 select-none group-data-[size=sm]/native-select:right-2 group-data-[size=sm]/native-select:size-4"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
};

export type NativeSelectOptionProps = ComponentProps<'option'>;

export const NativeSelectOption: FC<NativeSelectOptionProps> = ({ className, ...props }) => {
  return (
    <option
      data-slot="native-select-option"
      className={cn('bg-popover text-popover-foreground', className)}
      {...props}
    />
  );
};

export type NativeSelectOptGroupProps = ComponentProps<'optgroup'>;

export const NativeSelectOptGroup: FC<NativeSelectOptGroupProps> = ({ className, ...props }) => {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn('bg-popover text-popover-foreground', className)}
      {...props}
    />
  );
};
