import { Button } from '@books/ui/components/button';

import { useFormContext } from './form-context';

import type { ButtonProps } from '@books/ui/components/button';
import type { FC } from 'react';

/** Sends the form around it, and waits while it is being sent. */
const SubmitButton: FC<Omit<ButtonProps, 'type' | 'disabled'>> = (props) => {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => <Button {...props} type="submit" disabled={isSubmitting} />}
    </form.Subscribe>
  );
};

export default SubmitButton;
