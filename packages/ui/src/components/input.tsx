import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from 'cn';

import type { ComponentProps, FC } from 'react';

export type InputProps = ComponentProps<'input'>;

export const Input: FC<InputProps> = ({ className, type, ...props }) => {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'border-input bg-card text-foreground file:text-foreground placeholder:text-muted-foreground hover:not-disabled:border-foreground focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-offset-background disabled:bg-background disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-destructive h-11 w-full min-w-0 rounded-md border px-3 py-1 font-serif text-[17px] leading-6 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:italic focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-dashed aria-invalid:ring-1',
        className,
      )}
      {...props}
    />
  );
};
