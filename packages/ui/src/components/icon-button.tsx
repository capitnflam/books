import { Button } from './button';
import { Icon } from './icon';

import type { ButtonProps } from './button';
import type { IconName } from './icon';
import type { FC } from 'react';

type IconButtonSize = 'default' | 'xs' | 'sm' | 'lg';

// Icon buttons use the square `icon-*` button sizes, not the padded text sizes.
const buttonSizes: Record<IconButtonSize, NonNullable<ButtonProps['size']>> = {
  default: 'icon',
  xs: 'icon-xs',
  sm: 'icon-sm',
  lg: 'icon-lg',
};

export type IconButtonProps = Omit<ButtonProps, 'children' | 'size' | 'aria-label'> & {
  size?: IconButtonSize;
  icon: IconName;
  /** Accessible name announced by screen readers, since the button has no visible text. */
  label: string;
};

export const IconButton: FC<IconButtonProps> = ({ size = 'default', icon, label, ...props }) => {
  return (
    <Button size={buttonSizes[size]} aria-label={label} {...props}>
      <Icon icon={icon} aria-hidden />
    </Button>
  );
};
