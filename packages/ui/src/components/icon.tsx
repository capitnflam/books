import { icons } from '@tabler/icons-react';

import type { RemovePrefix, PascalToKebab } from '@books/shared';
import type { IconProps as TablerIconProps } from '@tabler/icons-react';
import type { FC } from 'react';

export type IconName = PascalToKebab<RemovePrefix<keyof typeof icons, 'Icon'>>;

export type IconProps = TablerIconProps & {
  icon: IconName;
};

export const Icon: FC<IconProps> = ({ icon, ...props }) => {
  const computedIconName = `Icon${icon
    .split('-')
    .map((x) => (x.length > 0 ? x[0]!.toUpperCase() + x.slice(1) : x))
    .join('')}`;
  const IconComponent = icons[computedIconName as keyof typeof icons];

  return <IconComponent {...props} />;
};
