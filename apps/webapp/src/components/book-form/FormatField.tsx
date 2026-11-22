import { NativeSelect, NativeSelectOption } from '@books/ui/components/native-select';

import { useFieldContext } from '#/components/form/form-context';
import FormField from '#/components/form/FormField';
import { m } from '#/paraglide/messages';
import { EDITION_FORMATS } from '#/services/catalog/catalog';
import { formatLabel } from '#/services/catalog/labels';

import type { EditionValues } from '#/services/catalog/catalog';
import type { FC } from 'react';

const FormatField: FC = () => {
  const field = useFieldContext<EditionValues['format']>();

  return (
    <FormField label={m.book_format_label()}>
      {(props) => (
        <NativeSelect
          className="w-full"
          value={field.state.value}
          onChange={(event) => field.handleChange(event.target.value as EditionValues['format'])}
          onBlur={field.handleBlur}
          {...props}
        >
          <NativeSelectOption value="">{m.book_format_unknown()}</NativeSelectOption>
          {EDITION_FORMATS.map((format) => (
            <NativeSelectOption key={format} value={format}>
              {formatLabel(format)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      )}
    </FormField>
  );
};

export default FormatField;
