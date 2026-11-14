import { Icon } from '@books/ui/components/icon';

import type { FC, ReactNode } from 'react';

type ErrorMessageProps = { children: ReactNode };

/** An error announced to screen readers, in the alert colour with its icon. */
const ErrorMessage: FC<ErrorMessageProps> = ({ children }) => (
  <p role="alert" className="text-destructive flex items-center gap-2 text-base/6">
    <Icon icon="alert-circle" aria-hidden className="size-5 shrink-0" />
    {children}
  </p>
);

export default ErrorMessage;
