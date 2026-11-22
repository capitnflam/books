import { FieldGroup } from '@books/ui/components/field';

import { withFieldGroup } from '#/hooks/use-app-form';
import { m } from '#/paraglide/messages';
import {
  BOOK_DESCRIPTION_MAX_LENGTH,
  BOOK_TITLE_MAX_LENGTH,
  CONTRIBUTOR_ROLES,
  emptyWorkValues,
} from '#/services/catalog/catalog';

import ContributorsFields from './ContributorsFields';
import GenresField from './GenresField';
import LanguageField from './LanguageField';

import type { ContributorRole } from '@books/database';
import type { ReactNode } from 'react';

type WorkFieldsProps = {
  contributorsHint: string;
  contributorRoles: readonly ContributorRole[];
  /** The fields for the series: one on the add form, several on the edit form. */
  series: ReactNode;
};

const props: WorkFieldsProps = {
  contributorsHint: '',
  contributorRoles: CONTRIBUTOR_ROLES,
  series: null,
};

/** The fields describing a work, whatever its editions. */
const WorkFields = withFieldGroup({
  defaultValues: emptyWorkValues(),
  props,
  render: function WorkFieldsRender({ group, contributorsHint, contributorRoles, series }) {
    return (
      <FieldGroup>
        <group.AppField name="title">
          {(field) => (
            <field.TextField
              label={m.book_title_label()}
              error={m.book_title_error({ max: BOOK_TITLE_MAX_LENGTH })}
            />
          )}
        </group.AppField>
        <group.AppField name="subtitle">
          {(field) => (
            <field.TextField
              label={m.book_subtitle_label()}
              error={m.book_subtitle_error({ max: BOOK_TITLE_MAX_LENGTH })}
            />
          )}
        </group.AppField>
        <ContributorsFields
          form={group}
          fields={{ contributors: 'contributors' }}
          hint={contributorsHint}
          roles={contributorRoles}
        />
        <group.AppField name="description">
          {(field) => (
            <field.TextareaField
              rows={5}
              className="max-h-96"
              label={m.book_description_label()}
              error={m.book_description_error({ max: BOOK_DESCRIPTION_MAX_LENGTH })}
            />
          )}
        </group.AppField>
        <div className="grid gap-4 sm:grid-cols-2">
          <group.AppField name="originalLanguage">
            {() => <LanguageField label={m.book_original_language_label()} />}
          </group.AppField>
          <group.AppField name="firstPublishedYear">
            {(field) => (
              <field.TextField
                inputMode="numeric"
                label={m.book_first_published_label()}
                hint={m.book_first_published_hint()}
                error={m.book_first_published_error()}
              />
            )}
          </group.AppField>
        </div>
        {series}
        <group.AppField name="genres">{() => <GenresField />}</group.AppField>
        <group.AppField name="subjects">
          {(field) => (
            <field.TextField
              label={m.book_subjects_label()}
              hint={m.book_subjects_hint()}
              error={m.book_subjects_error()}
            />
          )}
        </group.AppField>
      </FieldGroup>
    );
  },
});

export default WorkFields;
