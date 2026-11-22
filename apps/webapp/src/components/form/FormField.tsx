import { Field, FieldDescription, FieldError, FieldLabel } from '@books/ui/components/field';

import { useFieldContext } from './form-context';

import type { FC, ReactNode } from 'react';

export type FormFieldTexts = {
  label: string;
  hint?: string;
  /** Shown while the field's value is refused. */
  error?: string;
};

type ControlProps = { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string };

type FormFieldProps = FormFieldTexts & { children: (props: ControlProps) => ReactNode };

/** The form field around it: a labelled control with its hint and error, wired together. */
const FormField: FC<FormFieldProps> = ({ label, hint, error, children }) => {
  const field = useFieldContext();
  const id = `field-${field.name}`;
  const invalid = field.state.meta.errors.length > 0 ? true : undefined;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children({
        id,
        'aria-invalid': invalid,
        'aria-describedby': hint ? `${id}-hint` : undefined,
      })}
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      <FieldError>{invalid && error}</FieldError>
    </Field>
  );
};

export default FormField;
