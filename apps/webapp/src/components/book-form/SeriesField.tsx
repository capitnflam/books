import { Button } from '@books/ui/components/button';
import { FieldError, FieldLegend, FieldSet } from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { IconButton } from '@books/ui/components/icon-button';
import { Input } from '@books/ui/components/input';

import { m } from '#/paraglide/messages';
import { SERIES_MAX, emptySeries } from '#/services/catalog/catalog';

import type { SeriesForm } from '#/services/catalog/catalog';
import type { FC } from 'react';

type SeriesFieldProps = {
  series: SeriesForm[];
  /** The fields to mark, by name: `series.0.position`. */
  errors: ReadonlySet<string>;
  onChange: (series: SeriesForm[]) => void;
};

/** The series a book is in, with its number in each: one row each, with rows to add and remove. */
const SeriesField: FC<SeriesFieldProps> = ({ series, errors, onChange }) => {
  const update = (index: number, change: Partial<SeriesForm>) =>
    onChange(series.map((row, at) => (at === index ? { ...row, ...change } : row)));

  return (
    <FieldSet>
      <FieldLegend variant="label">{m.book_series_label()}</FieldLegend>
      <ul className="flex flex-col gap-3">
        {series.map(({ name, position }, index) => {
          const number = index + 1;
          const nameError = errors.has(`series.${index}.name`);
          const positionError = errors.has(`series.${index}.position`);

          return (
            // Rows have no id of their own; they are only ever added and removed by position.
            // oxlint-disable-next-line react/no-array-index-key
            <li key={index} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  aria-label={m.book_series_row_name({ number })}
                  aria-invalid={nameError ? true : undefined}
                  autoComplete="off"
                  className="min-w-32 flex-1"
                  value={name}
                  onChange={(event) => update(index, { name: event.target.value })}
                />
                <Input
                  aria-label={m.book_series_row_position({ number })}
                  aria-invalid={positionError ? true : undefined}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={m.book_series_position_placeholder()}
                  className="w-20"
                  value={position}
                  onChange={(event) => update(index, { position: event.target.value })}
                />
                <IconButton
                  variant="ghost"
                  icon="trash"
                  label={m.book_series_remove({ number })}
                  disabled={series.length === 1 && !name && !position}
                  onClick={() =>
                    onChange(
                      series.length === 1
                        ? [emptySeries()]
                        : series.filter((_, at) => at !== index),
                    )
                  }
                />
              </div>
              {nameError && <FieldError>{m.book_series_name_error()}</FieldError>}
              {positionError && <FieldError>{m.book_series_position_error()}</FieldError>}
            </li>
          );
        })}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...series, emptySeries()])}
      >
        <Icon icon="plus" aria-hidden data-icon="inline-start" />
        {m.book_series_add()}
      </Button>
      {errors.has('series') && (
        <FieldError>{m.book_series_too_many({ max: SERIES_MAX })}</FieldError>
      )}
    </FieldSet>
  );
};

export default SeriesField;
