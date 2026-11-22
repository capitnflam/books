import { cn } from 'cn';

import type { ComponentProps, FC } from 'react';

export type TextareaProps = ComponentProps<'textarea'>;

export const Textarea: FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input bg-card text-foreground placeholder:text-muted-foreground hover:not-disabled:border-foreground focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-offset-background disabled:bg-background disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-destructive flex field-sizing-content min-h-24 w-full resize-y rounded-md border px-3 py-2.5 font-serif text-[17px] leading-6 transition-colors outline-none placeholder:italic focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-dashed aria-invalid:ring-1',
        className,
      )}
      {...props}
    />
  );
};
