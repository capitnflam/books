import { FieldGroup } from '@books/ui/components/field';
import { Input } from '@books/ui/components/input';
import { Textarea } from '@books/ui/components/textarea';

import { m } from '#/paraglide/messages';
import { BOOK_DESCRIPTION_MAX_LENGTH, BOOK_TITLE_MAX_LENGTH } from '#/services/catalog/catalog';

import ContributorsField from './ContributorsField';
import FormField from './FormField';
import GenresField from './GenresField';
import LanguageSelect from './LanguageSelect';

import type { WorkValues } from '#/services/catalog/catalog';
import type { ContributorRole } from '@books/database';
import type { ChangeEvent, FC, ReactNode } from 'react';

type WorkFieldsProps = {
  form: WorkValues;
  /** The fields to mark, by name. */
  errors: ReadonlySet<string>;
  contributorsHint: string;
  contributorRoles?: readonly ContributorRole[];
  /** The fields for the series: one on the add form, several on the edit form. */
  series: ReactNode;
  onChange: (change: Partial<WorkValues>) => void;
};

/** The fields describing a work, whatever its editions. */
const WorkFields: FC<WorkFieldsProps> = ({
  form,
  errors,
  contributorsHint,
  contributorRoles,
  series,
  onChange,
}) => {
  const set =
    (key: keyof WorkValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ [key]: event.target.value });
  const error = (key: keyof WorkValues, message: string) => errors.has(key) && message;

  return (
    <FieldGroup>
      <FormField
        name="title"
        label={m.book_title_label()}
        error={error('title', m.book_title_error({ max: BOOK_TITLE_MAX_LENGTH }))}
      >
        {(props) => (
          <Input autoComplete="off" value={form.title} onChange={set('title')} {...props} />
        )}
      </FormField>
      <FormField
        name="subtitle"
        label={m.book_subtitle_label()}
        error={error('subtitle', m.book_subtitle_error({ max: BOOK_TITLE_MAX_LENGTH }))}
      >
        {(props) => (
          <Input autoComplete="off" value={form.subtitle} onChange={set('subtitle')} {...props} />
        )}
      </FormField>
      <ContributorsField
        contributors={form.contributors}
        hint={contributorsHint}
        roles={contributorRoles}
        invalid={(index) => errors.has(`contributors.${index}.name`)}
        tooMany={errors.has('contributors')}
        onChange={(contributors) => onChange({ contributors })}
      />
      <FormField
        name="description"
        label={m.book_description_label()}
        error={error('description', m.book_description_error({ max: BOOK_DESCRIPTION_MAX_LENGTH }))}
      >
        {(props) => (
          <Textarea
            rows={5}
            className="max-h-96"
            value={form.description}
            onChange={set('description')}
            {...props}
          />
        )}
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          name="original-language"
          label={m.book_original_language_label()}
          error={error('originalLanguage', m.book_language_error())}
        >
          {(props) => (
            <LanguageSelect
              value={form.originalLanguage}
              onChange={(originalLanguage) => onChange({ originalLanguage })}
              {...props}
            />
          )}
        </FormField>
        <FormField
          name="first-published"
          label={m.book_first_published_label()}
          hint={m.book_first_published_hint()}
          error={error('firstPublishedYear', m.book_first_published_error())}
        >
          {(props) => (
            <Input
              inputMode="numeric"
              autoComplete="off"
              value={form.firstPublishedYear}
              onChange={set('firstPublishedYear')}
              {...props}
            />
          )}
        </FormField>
      </div>
      {series}
      <GenresField
        genres={form.genres}
        invalid={errors.has('genres')}
        onChange={(genres) => onChange({ genres })}
      />
      <FormField
        name="subjects"
        label={m.book_subjects_label()}
        hint={m.book_subjects_hint()}
        error={error('subjects', m.book_subjects_error())}
      >
        {(props) => (
          <Input autoComplete="off" value={form.subjects} onChange={set('subjects')} {...props} />
        )}
      </FormField>
    </FieldGroup>
  );
};

export default WorkFields;
