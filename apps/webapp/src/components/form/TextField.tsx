import { Input } from '@books/ui/components/input';

import { useFieldContext } from './form-context';
import FormField from './FormField';

import type { FormFieldTexts } from './FormField';
import type { ComponentProps, FC } from 'react';

type TextFieldProps = FormFieldTexts
  & Pick<ComponentProps<typeof Input>, 'type' | 'inputMode' | 'spellCheck' | 'className'>;

/** A line of text in a form. */
const TextField: FC<TextFieldProps> = ({ label, hint, error, ...inputProps }) => {
  const field = useFieldContext<string>();

  return (
    <FormField label={label} hint={hint} error={error}>
      {(props) => (
        <Input
          autoComplete="off"
          value={field.state.value}
          onChange={(event) => field.handleChange(event.target.value)}
          onBlur={field.handleBlur}
          {...inputProps}
          {...props}
        />
      )}
    </FormField>
  );
};

export default TextField;
