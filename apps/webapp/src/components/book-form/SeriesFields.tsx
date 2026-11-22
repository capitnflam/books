import { Button } from '@books/ui/components/button';
import { FieldError, FieldLegend, FieldSet } from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { IconButton } from '@books/ui/components/icon-button';
import { Input } from '@books/ui/components/input';

import { withFieldGroup } from '#/hooks/use-app-form';
import { m } from '#/paraglide/messages';
import { SERIES_MAX, emptySeries } from '#/services/catalog/catalog';

import type { SeriesForm } from '#/services/catalog/catalog';

const defaultValues: { series: SeriesForm[] } = { series: [] };

/** The series a book is in, with its number in each: one row each, with rows to add and remove. */
const SeriesFields = withFieldGroup({
  defaultValues,
  render: function SeriesFieldsRender({ group }) {
    return (
      <group.AppField name="series">
        {(list) => (
          <FieldSet>
            <FieldLegend variant="label">{m.book_series_label()}</FieldLegend>
            <ul className="flex flex-col gap-3">
              {list.state.value.map((row, index) => {
                const number = index + 1;

                return (
                  // Rows have no id of their own; they are only ever added and removed by position.
                  // oxlint-disable-next-line react/no-array-index-key
                  <li key={index} className="flex flex-col gap-1.5">
                    <group.AppField name={`series[${index}].name`}>
                      {(name) => (
                        <group.AppField name={`series[${index}].position`}>
                          {(position) => {
                            const nameError = name.state.meta.errors.length > 0;
                            const positionError = position.state.meta.errors.length > 0;

                            return (
                              <>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Input
                                    aria-label={m.book_series_row_name({ number })}
                                    aria-invalid={nameError ? true : undefined}
                                    autoComplete="off"
                                    className="min-w-32 flex-1"
                                    value={name.state.value}
                                    onChange={(event) => name.handleChange(event.target.value)}
                                    onBlur={name.handleBlur}
                                  />
                                  <Input
                                    aria-label={m.book_series_row_position({ number })}
                                    aria-invalid={positionError ? true : undefined}
                                    inputMode="decimal"
                                    autoComplete="off"
                                    placeholder={m.book_series_position_placeholder()}
                                    className="w-20"
                                    value={position.state.value}
                                    onChange={(event) => position.handleChange(event.target.value)}
                                    onBlur={position.handleBlur}
                                  />
                                  <IconButton
                                    variant="ghost"
                                    icon="trash"
                                    label={m.book_series_remove({ number })}
                                    disabled={
                                      list.state.value.length === 1 && !row.name && !row.position
                                    }
                                    onClick={() => {
                                      if (list.state.value.length === 1) {
                                        list.handleChange([emptySeries()]);
                                      } else {
                                        void list.removeValue(index);
                                      }
                                    }}
                                  />
                                </div>
                                {nameError && <FieldError>{m.book_series_name_error()}</FieldError>}
                                {positionError && (
                                  <FieldError>{m.book_series_position_error()}</FieldError>
                                )}
                              </>
                            );
                          }}
                        </group.AppField>
                      )}
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
              onClick={() => list.pushValue(emptySeries())}
            >
              <Icon icon="plus" aria-hidden data-icon="inline-start" />
              {m.book_series_add()}
            </Button>
            {list.state.meta.errors.length > 0 && (
              <FieldError>{m.book_series_too_many({ max: SERIES_MAX })}</FieldError>
            )}
          </FieldSet>
        )}
      </group.AppField>
    );
  },
});

export default SeriesFields;
