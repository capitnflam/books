import { Icon } from '@books/ui/components/icon';
import { createLink } from '@tanstack/react-router';

import type { ComponentProps, FC } from 'react';

const BackAnchor: FC<ComponentProps<'a'>> = ({ children, ...props }) => (
  <a
    {...props}
    className="text-link focus-visible:ring-ring focus-visible:ring-offset-background flex items-center gap-1.5 self-start rounded-sm text-base/6 underline-offset-3 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2"
  >
    <Icon icon="arrow-left" aria-hidden className="size-4.5" />
    {children}
  </a>
);

/** A link back up to the page this one was opened from, above the page's heading. */
const BackLink = createLink(BackAnchor);

export default BackLink;
