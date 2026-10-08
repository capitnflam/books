import { icons } from '@tabler/icons-react';

import type { RemovePrefix, PascalToKebab } from '@books/shared';
import type { IconProps as TablerIconProps } from '@tabler/icons-react';
import type { FC } from 'react';

type TablerIconName = keyof typeof icons;
export type IconName = PascalToKebab<RemovePrefix<TablerIconName, 'Icon'>>;

export type IconProps = TablerIconProps & {
  icon: IconName;
};

const ICON_NAME_MAP: Record<IconName, TablerIconName> = Object.keys(icons).reduce(
  (acc, key) => {
    const kebabKey = key
      .replaceAll(/([A-Z])/gu, '-$1')
      .replace(/^-Icon-/u, '')
      .toLowerCase() as IconName;
    acc[kebabKey] = key as TablerIconName;
    return acc;
  },
  {} as Record<IconName, TablerIconName>,
);

export const iconNameList = Object.keys(ICON_NAME_MAP) as IconName[];

export const Icon: FC<IconProps> = ({ icon, ...props }) => {
  const IconComponent = icons[ICON_NAME_MAP[icon]];

  return <IconComponent {...props} />;
};
