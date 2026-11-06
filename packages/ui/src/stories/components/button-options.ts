import type { ButtonProps } from '#/components/button';
import type { IconButtonProps } from '#/components/icon-button';

// Option lists shared by the Button and IconButton stories, typed against the components so
// they fail to compile when a variant or size is renamed.

export const buttonVariants: NonNullable<ButtonProps['variant']>[] = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
];

export const buttonTextSizes: NonNullable<ButtonProps['size']>[] = ['lg', 'default', 'sm', 'xs'];

export const buttonIconSizes: NonNullable<ButtonProps['size']>[] = [
  'icon-lg',
  'icon',
  'icon-sm',
  'icon-xs',
];

export const iconButtonSizes: NonNullable<IconButtonProps['size']>[] = [
  'lg',
  'default',
  'sm',
  'xs',
];
