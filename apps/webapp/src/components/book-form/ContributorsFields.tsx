import { Button } from '@books/ui/components/button';
import { FieldDescription, FieldError, FieldLegend, FieldSet } from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { IconButton } from '@books/ui/components/icon-button';
import { Input } from '@books/ui/components/input';
import { NativeSelect, NativeSelectOption } from '@books/ui/components/native-select';

import { withFieldGroup } from '#/hooks/use-app-form';
import { m } from '#/paraglide/messages';
import { CONTRIBUTORS_MAX, CONTRIBUTOR_ROLES, emptyContributor } from '#/services/catalog/catalog';
import { roleLabel } from '#/services/catalog/labels';

import type { ContributorForm } from '#/services/catalog/catalog';
import type { ContributorRole } from '@books/database';

type ContributorsFieldsProps = {
  hint: string;
  /** Roles offered, the first for new rows; a row's own role is added when it is another. */
  roles: readonly ContributorRole[];
};

const props: ContributorsFieldsProps = { hint: '', roles: CONTRIBUTOR_ROLES };
const defaultValues: { contributors: ContributorForm[] } = { contributors: [] };

/** People and what they did, in credit order: one row each, with rows to add and remove. */
const ContributorsFields = withFieldGroup({
  defaultValues,
  props,
  render: function ContributorsFieldsRender({ group, hint, roles }) {
    return (
      // Not `mode="array"`: it would miss the rows an ISBN lookup replaces as a whole.
      <group.AppField name="contributors">
        {(list) => (
          <FieldSet>
            <FieldLegend variant="label">{m.book_contributors_legend()}</FieldLegend>
            <FieldDescription id="book-contributors-hint">{hint}</FieldDescription>
            <ul className="flex flex-col gap-3">
              {list.state.value.map((_, index) => {
                const number = index + 1;

                return (
                  // Rows have no id of their own; they are only ever added and removed by position.
                  // oxlint-disable-next-line react/no-array-index-key
                  <li key={index} className="flex flex-col gap-1.5">
                    <group.AppField name={`contributors[${index}].name`}>
                      {(name) => {
                        const error = name.state.meta.errors.length > 0;

                        return (
                          <>
                            <div className="flex flex-wrap items-center gap-2">
                              <Input
                                aria-label={m.book_contributor_name({ number })}
                                aria-describedby="book-contributors-hint"
                                aria-invalid={error ? true : undefined}
                                autoComplete="off"
                                className="min-w-48 flex-1"
                                value={name.state.value}
                                onChange={(event) => name.handleChange(event.target.value)}
                                onBlur={name.handleBlur}
                              />
                              <group.AppField name={`contributors[${index}].role`}>
                                {(role) => (
                                  <NativeSelect
                                    aria-label={m.book_contributor_role({ number })}
                                    className="w-44"
                                    value={role.state.value}
                                    onChange={(event) =>
                                      role.handleChange(event.target.value as ContributorRole)
                                    }
                                    onBlur={role.handleBlur}
                                  >
                                    {CONTRIBUTOR_ROLES.filter(
                                      (option) =>
                                        roles.includes(option) || option === role.state.value,
                                    ).map((option) => (
                                      <NativeSelectOption key={option} value={option}>
                                        {roleLabel(option)}
                                      </NativeSelectOption>
                                    ))}
                                  </NativeSelect>
                                )}
                              </group.AppField>
                              <IconButton
                                variant="ghost"
                                icon="trash"
                                label={m.book_contributor_remove({ number })}
                                disabled={list.state.value.length === 1 && !name.state.value}
                                onClick={() => {
                                  if (list.state.value.length === 1) {
                                    list.handleChange([emptyContributor(roles[0])]);
                                  } else {
                                    void list.removeValue(index);
                                  }
                                }}
                              />
                            </div>
                            {error && <FieldError>{m.book_contributor_error()}</FieldError>}
                          </>
                        );
                      }}
                    </group.AppField>
                  </li>
                );
              })}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => list.pushValue(emptyContributor(roles[0]))}
            >
              <Icon icon="plus" aria-hidden data-icon="inline-start" />
              {m.book_contributor_add()}
            </Button>
            {list.state.meta.errors.length > 0 && (
              <FieldError>{m.book_contributors_too_many({ max: CONTRIBUTORS_MAX })}</FieldError>
            )}
          </FieldSet>
        )}
      </group.AppField>
    );
  },
});

export default ContributorsFields;
