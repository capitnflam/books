import { Textarea } from '@books/ui/components/textarea';

import { useFieldContext } from './form-context';
import FormField from './FormField';

import type { FormFieldTexts } from './FormField';
import type { ComponentProps, FC } from 'react';

type TextareaFieldProps = FormFieldTexts
  & Pick<ComponentProps<typeof Textarea>, 'rows' | 'className'>;

/** Several lines of text in a form. */
const TextareaField: FC<TextareaFieldProps> = ({ label, hint, error, ...textareaProps }) => {
  const field = useFieldContext<string>();

  return (
    <FormField label={label} hint={hint} error={error}>
      {(props) => (
        <Textarea
          value={field.state.value}
          onChange={(event) => field.handleChange(event.target.value)}
          onBlur={field.handleBlur}
          {...textareaProps}
          {...props}
        />
      )}
    </FormField>
  );
};

export default TextareaField;
