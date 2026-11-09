'use client';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { cn } from 'cn';

import type { ComponentProps, FC } from 'react';

export type AvatarProps = AvatarPrimitive.Root.Props & {
  size?: 'default' | 'sm' | 'lg';
};

export const Avatar: FC<AvatarProps> = ({ className, size = 'default', ...props }) => {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        'group/avatar after:border-border relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten',
        className,
      )}
      {...props}
    />
  );
};

export type AvatarImageProps = AvatarPrimitive.Image.Props;

export const AvatarImage: FC<AvatarImageProps> = ({ className, ...props }) => {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full rounded-full object-cover', className)}
      {...props}
    />
  );
};

export type AvatarFallbackProps = AvatarPrimitive.Fallback.Props;

export const AvatarFallback: FC<AvatarFallbackProps> = ({ className, ...props }) => {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-accent text-primary flex size-full items-center justify-center rounded-full text-sm font-medium',
        className,
      )}
      {...props}
    />
  );
};

export type AvatarBadgeProps = ComponentProps<'span'>;

export const AvatarBadge: FC<AvatarBadgeProps> = ({ className, ...props }) => {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none',
        'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
        'group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2',
        'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
        className,
      )}
      {...props}
    />
  );
};

export type AvatarGroupProps = ComponentProps<'div'>;

export const AvatarGroup: FC<AvatarGroupProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        // No background-coloured ring around each avatar (upstream's cut-out look): their own
        // rule border separates them. Garamond initials at text-sm are wider than upstream's
        // text-xs, so the overlap shrinks with the avatar size to leave them uncovered.
        'group/avatar-group flex -space-x-1 has-data-[size=lg]:-space-x-2 has-data-[size=sm]:space-x-0',
        className,
      )}
      {...props}
    />
  );
};

export type AvatarGroupCountProps = ComponentProps<'div'>;

export const AvatarGroupCount: FC<AvatarGroupCountProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        // Outlined like the avatars, so it does not fade into the parchment beside them.
        'bg-card text-muted-foreground border-border relative flex size-8 shrink-0 items-center justify-center rounded-full border text-sm group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3',
        className,
      )}
      {...props}
    />
  );
};
