import { FieldGroup } from '@books/ui/components/field';
import { Input } from '@books/ui/components/input';
import { NativeSelect, NativeSelectOption } from '@books/ui/components/native-select';

import BookCover from '#/components/BookCover';
import { m } from '#/paraglide/messages';
import { EDITION_FORMATS } from '#/services/catalog/catalog';
import { formatLabel } from '#/services/catalog/labels';

import FormField from './FormField';
import LanguageSelect from './LanguageSelect';

import type { EditionValues } from '#/services/catalog/catalog';
import type { ChangeEvent, FC } from 'react';

type EditionFieldsProps = {
  form: EditionValues;
  /** The fields to mark, by name. */
  errors: ReadonlySet<string>;
  /** Names the book on its cover. */
  title: string;
  onChange: (change: Partial<EditionValues>) => void;
};

/** The fields describing one published form of a book. */
const EditionFields: FC<EditionFieldsProps> = ({ form, errors, title, onChange }) => {
  const set =
    (key: keyof EditionValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ [key]: event.target.value });
  const error = (key: keyof EditionValues, message: string) => errors.has(key) && message;

  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          name="publisher"
          label={m.book_publisher_label()}
          error={error('publisher', m.book_text_error())}
        >
          {(props) => (
            <Input
              autoComplete="off"
              value={form.publisher}
              onChange={set('publisher')}
              {...props}
            />
          )}
        </FormField>
        <FormField
          name="published"
          label={m.book_published_label()}
          hint={m.book_published_hint()}
          error={error('published', m.book_published_error())}
        >
          {(props) => (
            <Input
              autoComplete="off"
              value={form.published}
              onChange={set('published')}
              {...props}
            />
          )}
        </FormField>
        <FormField
          name="edition-statement"
          label={m.book_edition_statement_label()}
          hint={m.book_edition_statement_hint()}
          error={error('editionStatement', m.book_text_error())}
        >
          {(props) => (
            <Input
              autoComplete="off"
              value={form.editionStatement}
              onChange={set('editionStatement')}
              {...props}
            />
          )}
        </FormField>
        <FormField
          name="language"
          label={m.book_language_label()}
          error={error('language', m.book_language_error())}
        >
          {(props) => (
            <LanguageSelect
              value={form.language}
              onChange={(language) => onChange({ language })}
              {...props}
            />
          )}
        </FormField>
        <FormField name="format" label={m.book_format_label()}>
          {(props) => (
            <NativeSelect
              className="w-full"
              value={form.format}
              onChange={set('format')}
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
        {form.format === 'audiobook' ? (
          <FormField
            name="duration"
            label={m.book_duration_label()}
            error={error('durationMinutes', m.book_number_error())}
          >
            {(props) => (
              <Input
                inputMode="numeric"
                autoComplete="off"
                value={form.durationMinutes}
                onChange={set('durationMinutes')}
                {...props}
              />
            )}
          </FormField>
        ) : (
          <FormField
            name="page-count"
            label={m.book_page_count_label()}
            error={error('pageCount', m.book_number_error())}
          >
            {(props) => (
              <Input
                inputMode="numeric"
                autoComplete="off"
                value={form.pageCount}
                onChange={set('pageCount')}
                {...props}
              />
            )}
          </FormField>
        )}
      </div>
      <FormField
        name="cover"
        label={m.book_cover_label()}
        hint={m.book_cover_hint()}
        error={error('coverImageUrl', m.book_cover_error())}
      >
        {(props) => (
          <Input
            type="url"
            autoComplete="off"
            spellCheck={false}
            value={form.coverImageUrl}
            onChange={set('coverImageUrl')}
            {...props}
          />
        )}
      </FormField>
      <BookCover
        url={form.coverImageUrl}
        alt={title ? m.book_cover_alt({ title }) : ''}
        className="h-48 w-auto self-start"
      />
    </FieldGroup>
  );
};

export default EditionFields;
