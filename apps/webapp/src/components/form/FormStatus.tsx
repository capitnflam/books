import ErrorMessage from '#/components/ErrorMessage';
import { m } from '#/paraglide/messages';

import { useFormContext } from './form-context';

import type { FC, ReactNode } from 'react';

type FormStatusProps = {
  /** What became of the last time the form was sent, if it was refused or failed. */
  children?: ReactNode;
};

/** Why the form around it was not saved: fields to correct, or else what the server answered. */
const FormStatus: FC<FormStatusProps> = ({ children }) => {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => !state.isValid}>
      {(invalid) => (invalid ? <ErrorMessage>{m.form_invalid()}</ErrorMessage> : children)}
    </form.Subscribe>
  );
};

export default FormStatus;
