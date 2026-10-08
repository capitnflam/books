import { Button } from './button';
import { Icon } from './icon';

import type { ButtonProps } from './button';
import type { IconName } from './icon';
import type { FC } from 'react';

type IconButtonSize = 'default' | 'xs' | 'sm' | 'lg';

export type IconButtonProps = Omit<ButtonProps, 'children' | 'size'> & {
  size?: IconButtonSize;
  icon: IconName;
};

export const IconButton: FC<IconButtonProps> = ({ size = 'default', icon, ...props }) => {
  return (
    <Button size={size} {...props}>
      <Icon icon={icon} />
    </Button>
  );
};
