import { cn } from 'cn';

import type { ComponentProps, FC } from 'react';

export type SkeletonProps = ComponentProps<'div'>;

export const Skeleton: FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-border animate-pulse rounded-md', className)}
      {...props}
    />
  );
};
