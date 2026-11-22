import { createLink } from '@tanstack/react-router';

import type { ComponentProps, FC } from 'react';

const TextAnchor: FC<ComponentProps<'a'>> = ({ className = '', children, ...props }) => (
  <a
    {...props}
    className={`text-link focus-visible:ring-ring focus-visible:ring-offset-background rounded-sm underline-offset-3 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
  >
    {children}
  </a>
);

/** A link to another page, inside text or a list. */
const TextLink = createLink(TextAnchor);

export default TextLink;
