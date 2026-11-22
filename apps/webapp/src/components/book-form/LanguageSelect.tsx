import { NativeSelect, NativeSelectOption } from '@books/ui/components/native-select';

import { m } from '#/paraglide/messages';
import { getLocale } from '#/paraglide/runtime';
import { LANGUAGE_OPTIONS } from '#/services/catalog/catalog';
import { languageName } from '#/services/catalog/labels';

import type { NativeSelectProps } from '@books/ui/components/native-select';
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

type LanguageSelectProps = Omit<NativeSelectProps, 'value' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
};

const LanguageSelect: FC<LanguageSelectProps> = ({ value, onChange, ...props }) => (
  <NativeSelect
    className="w-full"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    {...props}
  >
    <NativeSelectOption value="">{m.book_language_unknown()}</NativeSelectOption>
    {languageOptions(value).map(({ tag, name }) => (
      <NativeSelectOption key={tag} value={tag}>
        {name}
      </NativeSelectOption>
    ))}
  </NativeSelect>
);

export default LanguageSelect;
