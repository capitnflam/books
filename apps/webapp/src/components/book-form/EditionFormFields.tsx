import { FieldGroup } from '@books/ui/components/field';
import { createFieldMap } from '@tanstack/react-form';

import { withFieldGroup } from '#/hooks/use-app-form';
import { m } from '#/paraglide/messages';
import {
  BOOK_TITLE_MAX_LENGTH,
  EDITION_CREDIT_ROLES,
  emptyEditionForm,
  emptyEditionValues,
} from '#/services/catalog/catalog';

import ContributorsFields from './ContributorsFields';
import EditionFields from './EditionFields';

type EditionFormFieldsProps = {
  /** Names the edition on its cover when it has no title of its own. */
  bookTitle: string;
};

const props: EditionFormFieldsProps = { bookTitle: '' };
const { isbn: _isbn, ...defaultValues } = emptyEditionForm();
const editionFields = createFieldMap(emptyEditionValues());

/** The fields of an edition of a book that exists already, but for its ISBN. */
const EditionFormFields = withFieldGroup({
  defaultValues,
  props,
  render: function EditionFormFieldsRender({ group, bookTitle }) {
    return (
      <FieldGroup>
        <group.AppField name="title">
          {(field) => (
            <field.TextField
              label={m.book_edition_title_label()}
              hint={m.book_edition_title_hint()}
              error={m.book_edition_title_error({ max: BOOK_TITLE_MAX_LENGTH })}
            />
          )}
        </group.AppField>
        <group.AppField name="subtitle">
          {(field) => (
            <field.TextField
              label={m.book_edition_subtitle_label()}
              error={m.book_subtitle_error({ max: BOOK_TITLE_MAX_LENGTH })}
            />
          )}
        </group.AppField>
        <ContributorsFields
          form={group}
          fields={{ contributors: 'contributors' }}
          hint={m.book_edition_contributors_hint()}
          roles={EDITION_CREDIT_ROLES}
        />
        <group.Subscribe selector={({ values }) => values.title}>
          {(title) => (
            <EditionFields form={group} fields={editionFields} title={title || bookTitle} />
          )}
        </group.Subscribe>
      </FieldGroup>
    );
  },
});

export default EditionFormFields;
