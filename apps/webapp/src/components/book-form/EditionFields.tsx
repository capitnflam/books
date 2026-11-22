import { FieldGroup } from '@books/ui/components/field';

import BookCover from '#/components/BookCover';
import { withFieldGroup } from '#/hooks/use-app-form';
import { m } from '#/paraglide/messages';
import { emptyEditionValues } from '#/services/catalog/catalog';

import FormatField from './FormatField';
import LanguageField from './LanguageField';

type EditionFieldsProps = {
  /** Names the book on its cover. */
  title: string;
};

const props: EditionFieldsProps = { title: '' };

/** The fields describing one published form of a book. */
const EditionFields = withFieldGroup({
  defaultValues: emptyEditionValues(),
  props,
  render: function EditionFieldsRender({ group, title }) {
    return (
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <group.AppField name="publisher">
            {(field) => (
              <field.TextField label={m.book_publisher_label()} error={m.book_text_error()} />
            )}
          </group.AppField>
          <group.AppField name="published">
            {(field) => (
              <field.TextField
                label={m.book_published_label()}
                hint={m.book_published_hint()}
                error={m.book_published_error()}
              />
            )}
          </group.AppField>
          <group.AppField name="editionStatement">
            {(field) => (
              <field.TextField
                label={m.book_edition_statement_label()}
                hint={m.book_edition_statement_hint()}
                error={m.book_text_error()}
              />
            )}
          </group.AppField>
          <group.AppField name="language">
            {() => <LanguageField label={m.book_language_label()} />}
          </group.AppField>
          <group.AppField name="format">{() => <FormatField />}</group.AppField>
          <group.Subscribe selector={({ values }) => values.format === 'audiobook'}>
            {(isAudiobook) =>
              isAudiobook ? (
                <group.AppField name="durationMinutes">
                  {(field) => (
                    <field.TextField
                      inputMode="numeric"
                      label={m.book_duration_label()}
                      error={m.book_number_error()}
                    />
                  )}
                </group.AppField>
              ) : (
                <group.AppField name="pageCount">
                  {(field) => (
                    <field.TextField
                      inputMode="numeric"
                      label={m.book_page_count_label()}
                      error={m.book_number_error()}
                    />
                  )}
                </group.AppField>
              )
            }
          </group.Subscribe>
        </div>
        <group.AppField name="coverImageUrl">
          {(field) => (
            <>
              <field.TextField
                type="url"
                spellCheck={false}
                label={m.book_cover_label()}
                hint={m.book_cover_hint()}
                error={m.book_cover_error()}
              />
              <BookCover
                url={field.state.value}
                alt={title ? m.book_cover_alt({ title }) : ''}
                className="h-48 w-auto self-start"
              />
            </>
          )}
        </group.AppField>
      </FieldGroup>
    );
  },
});

export default EditionFields;
