import { icons } from '@tabler/icons-react';

import type { IconProps as TablerIconProps } from '@tabler/icons-react';
import type { FC } from 'react';

export type IconName = keyof typeof icons; // Original PascalCase keys are kept for internal use

export type IconProps = TablerIconProps & {
  icon: IconName;
};

export const Icon: FC<IconProps> = ({ icon, ...props }) => {
  const IconComponent = icons[icon];

  return <IconComponent {...props} />;
};
