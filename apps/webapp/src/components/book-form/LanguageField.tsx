import { NativeSelect, NativeSelectOption } from '@books/ui/components/native-select';

import { useFieldContext } from '#/components/form/form-context';
import FormField from '#/components/form/FormField';
import { m } from '#/paraglide/messages';
import { getLocale } from '#/paraglide/runtime';
import { LANGUAGE_OPTIONS } from '#/services/catalog/catalog';
import { languageName } from '#/services/catalog/labels';

import type { FC } from 'react';

/** The menu's languages, sorted by name, with `current` added when it is not one of them. */
function languageOptions(current: string) {
  const tags: string[] = [...LANGUAGE_OPTIONS];

  if (current && !tags.includes(current)) {
    tags.push(current);
  }

  return tags
    .map((tag) => ({ tag, name: languageName(tag) }))
    .toSorted((a, b) => a.name.localeCompare(b.name, getLocale()));
}

type LanguageFieldProps = { label: string };

const LanguageField: FC<LanguageFieldProps> = ({ label }) => {
  const field = useFieldContext<string>();

  return (
    <FormField label={label} error={m.book_language_error()}>
      {(props) => (
        <NativeSelect
          className="w-full"
          value={field.state.value}
          onChange={(event) => field.handleChange(event.target.value)}
          onBlur={field.handleBlur}
          {...props}
        >
          <NativeSelectOption value="">{m.book_language_unknown()}</NativeSelectOption>
          {languageOptions(field.state.value).map(({ tag, name }) => (
            <NativeSelectOption key={tag} value={tag}>
              {name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      )}
    </FormField>
  );
};

export default LanguageField;
