import { Button } from '@books/ui/components/button';
import { FieldDescription, FieldError, FieldLegend, FieldSet } from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { IconButton } from '@books/ui/components/icon-button';
import { Input } from '@books/ui/components/input';
import { NativeSelect, NativeSelectOption } from '@books/ui/components/native-select';

import { m } from '#/paraglide/messages';
import { CONTRIBUTORS_MAX, CONTRIBUTOR_ROLES, emptyContributor } from '#/services/catalog/catalog';
import { roleLabel } from '#/services/catalog/labels';

import type { ContributorForm } from '#/services/catalog/catalog';
import type { ContributorRole } from '@books/database';
import type { FC } from 'react';

type ContributorsFieldProps = {
  contributors: ContributorForm[];
  hint: string;
  /** Roles offered, the first for new rows; a row's own role is added when it is another. */
  roles?: readonly ContributorRole[];
  invalid: (index: number) => boolean;
  /** More rows than the server takes. */
  tooMany: boolean;
  onChange: (contributors: ContributorForm[]) => void;
};

/** People and what they did, in credit order: one row each, with rows to add and remove. */
const ContributorsField: FC<ContributorsFieldProps> = ({
  contributors,
  hint,
  roles = CONTRIBUTOR_ROLES,
  invalid,
  tooMany,
  onChange,
}) => {
  const update = (index: number, change: Partial<ContributorForm>) =>
    onChange(contributors.map((row, at) => (at === index ? { ...row, ...change } : row)));

  return (
    <FieldSet>
      <FieldLegend variant="label">{m.book_contributors_legend()}</FieldLegend>
      <FieldDescription id="book-contributors-hint">{hint}</FieldDescription>
      <ul className="flex flex-col gap-3">
        {contributors.map((contributor, index) => {
          const number = index + 1;
          const error = invalid(index);

          return (
            // Rows have no id of their own; they are only ever added and removed by position.
            // oxlint-disable-next-line react/no-array-index-key
            <li key={index} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  aria-label={m.book_contributor_name({ number })}
                  aria-describedby="book-contributors-hint"
                  aria-invalid={error ? true : undefined}
                  autoComplete="off"
                  className="min-w-48 flex-1"
                  value={contributor.name}
                  onChange={(event) => update(index, { name: event.target.value })}
                />
                <NativeSelect
                  aria-label={m.book_contributor_role({ number })}
                  className="w-44"
                  value={contributor.role}
                  onChange={(event) =>
                    update(index, { role: event.target.value as ContributorRole })
                  }
                >
                  {CONTRIBUTOR_ROLES.filter(
                    (role) => roles.includes(role) || role === contributor.role,
                  ).map((role) => (
                    <NativeSelectOption key={role} value={role}>
                      {roleLabel(role)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <IconButton
                  variant="ghost"
                  icon="trash"
                  label={m.book_contributor_remove({ number })}
                  disabled={contributors.length === 1 && !contributor.name}
                  onClick={() =>
                    onChange(
                      contributors.length === 1
                        ? [emptyContributor(roles[0])]
                        : contributors.filter((_, at) => at !== index),
                    )
                  }
                />
              </div>
              {error && <FieldError>{m.book_contributor_error()}</FieldError>}
            </li>
          );
        })}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...contributors, emptyContributor(roles[0])])}
      >
        <Icon icon="plus" aria-hidden data-icon="inline-start" />
        {m.book_contributor_add()}
      </Button>
      {tooMany && (
        <FieldError>{m.book_contributors_too_many({ max: CONTRIBUTORS_MAX })}</FieldError>
      )}
    </FieldSet>
  );
};

export default ContributorsField;
