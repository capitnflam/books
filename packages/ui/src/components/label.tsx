import { cn } from 'cn';

import type { ComponentProps, FC } from 'react';

export type LabelProps = ComponentProps<'label'>;

export const Label: FC<LabelProps> = ({ className, ...props }) => {
  return (
    <label
      data-slot="label"
      className={cn(
        'text-foreground flex items-center gap-2 text-base leading-6 font-semibold select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
};
