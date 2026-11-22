import { Field, FieldDescription, FieldError, FieldLabel } from '@books/ui/components/field';

import type { FC, ReactNode } from 'react';

type FormFieldProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string | false;
  children: (props: {
    id: string;
    'aria-invalid'?: true;
    'aria-describedby'?: string;
  }) => ReactNode;
};

/** A labelled control with its hint and error, wired together for screen readers. */
const FormField: FC<FormFieldProps> = ({ name, label, hint, error, children }) => {
  const id = `book-${name}`;

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': hint ? `${id}-hint` : undefined,
      })}
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
};

export default FormField;
