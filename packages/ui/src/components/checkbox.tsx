import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { cn } from 'cn';

import { Icon } from './icon';

import type { FC } from 'react';

export type CheckboxProps = CheckboxPrimitive.Root.Props;

export const Checkbox: FC<CheckboxProps> = ({ className, ...props }) => {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer border-input bg-card hover:not-data-disabled:border-foreground focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground relative flex size-5 shrink-0 items-center justify-center rounded-sm border transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-3 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-1',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group grid place-content-center text-current transition-none [&>svg]:size-4"
      >
        <Icon icon="check" aria-hidden className="group-data-indeterminate:hidden" />
        <Icon icon="minus" aria-hidden className="hidden group-data-indeterminate:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
};
