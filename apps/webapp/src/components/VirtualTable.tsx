import { Button } from '@books/ui/components/button';
import { Checkbox } from '@books/ui/components/checkbox';
import { Icon } from '@books/ui/components/icon';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';

import ErrorMessage from '#/components/ErrorMessage';
import { m } from '#/paraglide/messages';
import { selectionState } from '#/services/feature-flags/feature-flags';

import type { ReactNode } from 'react';

/** Height of a row before it is measured: an avatar with a name and an email. */
const ROW_HEIGHT = 65;

/** Rows drawn above and below the visible ones, so fast scrolling shows no gap. */
const OVERSCAN = 8;

/** A column: its heading (a message, read when drawn so it follows the locale) and cells. */
export type VirtualTableColumn<Row> = {
  id: string;
  header: () => string;
  cell: (row: Row) => ReactNode;
  className?: string;
};

/** Checkboxes on each row, and one in the header over every loaded row. */
type Selection = {
  selected: ReadonlySet<string>;
  onSelectedChange: (selected: Set<string>) => void;
  disabled: boolean;
  /** The row's checkbox label, e.g. "Select Ada Lovelace". */
  rowLabel: (id: string) => string;
};

type VirtualTableProps<Row extends { id: string }> = {
  /** Names the table for screen readers. */
  label: string;
  rows: Row[];
  /** Every row on the server, loaded or not. */
  total: number;
  columns: VirtualTableColumn<Row>[];
  hasMore: boolean;
  loadingMore: boolean;
  loadFailed: boolean;
  loadMore: () => void;
  selection?: Selection;
};

/**
 * A table that only draws the rows in view, and loads more as it scrolls to the end. It
 * scrolls inside its own box, under a header that stays put. Screen readers get the full row
 * count (`aria-rowcount`) and each row's position, since rows out of view are not drawn.
 */
export function VirtualTable<Row extends { id: string }>({
  label,
  rows,
  total,
  columns,
  hasMore,
  loadingMore,
  loadFailed,
  loadMore,
  selection,
}: VirtualTableProps<Row>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // The React Compiler leaves this component unmemoized, as useVirtualizer needs.
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    // One more row at the end while more can load: it shows the loading message.
    count: hasMore ? rows.length + 1 : rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
    // The server has no scroll box to measure: render the first rows as if it were open.
    initialRect: { width: 0, height: 8 * ROW_HEIGHT },
  });
  const items = virtualizer.getVirtualItems();
  const lastIndex = items.at(-1)?.index ?? 0;

  useEffect(() => {
    if (hasMore && !loadingMore && !loadFailed && lastIndex >= rows.length - 1) {
      loadMore();
    }
  }, [hasMore, loadingMore, loadFailed, lastIndex, rows.length, loadMore]);

  const paddingTop = items[0]?.start ?? 0;
  const paddingBottom = virtualizer.getTotalSize() - (items.at(-1)?.end ?? 0);
  const columnCount = columns.length + (selection ? 1 : 0);
  const ids = rows.map(({ id }) => id);
  const all = selection ? selectionState(selection.selected, ids) : false;

  const toggle = (id: string, checked: boolean) => {
    if (!selection) {
      return;
    }

    const next = new Set(selection.selected);

    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }

    selection.onSelectedChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={scrollRef}
        // Scrollable regions must be reachable by keyboard.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="region"
        aria-label={label}
        className="border-border focus-visible:ring-ring focus-visible:ring-offset-background max-h-[32rem] overflow-auto rounded-md border outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <table aria-rowcount={total + 1} className="w-full min-w-md text-left text-base/6">
          <thead className="border-rule bg-background sticky top-0 z-10 border-b">
            <tr aria-rowindex={1}>
              {selection && (
                <th scope="col" className="w-12 py-2 pr-4 pl-4">
                  <Checkbox
                    aria-label={m.list_select_loaded()}
                    checked={all === true}
                    indeterminate={all === 'some'}
                    disabled={selection.disabled || rows.length === 0}
                    onCheckedChange={(checked) =>
                      selection.onSelectedChange(checked ? new Set(ids) : new Set())
                    }
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={column.id}
                  scope="col"
                  className={`text-muted-foreground py-2 pr-4 text-sm font-semibold ${!selection && index === 0 ? 'pl-4' : ''}`}
                >
                  {column.header()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr aria-hidden>
                <td colSpan={columnCount} style={{ height: paddingTop }} />
              </tr>
            )}
            {items.map((item) => {
              const row = rows[item.index];

              if (!row) {
                return (
                  <tr key="loading" data-index={item.index} ref={virtualizer.measureElement}>
                    <td
                      colSpan={columnCount}
                      className="text-muted-foreground px-4 py-5 text-center text-sm"
                    >
                      {loadFailed ? null : m.list_loading_more()}
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={row.id}
                  data-index={item.index}
                  ref={virtualizer.measureElement}
                  aria-rowindex={item.index + 2}
                  className="border-border border-b last:border-b-0"
                >
                  {selection && (
                    <td className="py-3 pr-4 pl-4">
                      <Checkbox
                        aria-label={selection.rowLabel(row.id)}
                        checked={selection.selected.has(row.id)}
                        disabled={selection.disabled}
                        onCheckedChange={(checked) => toggle(row.id, checked)}
                      />
                    </td>
                  )}
                  {columns.map((column, index) => (
                    <td
                      key={column.id}
                      className={`py-3 pr-4 ${!selection && index === 0 ? 'pl-4' : ''} ${column.className ?? ''}`}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr aria-hidden>
                <td colSpan={columnCount} style={{ height: paddingBottom }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="text-muted-foreground text-sm">
          {m.list_shown({ shown: rows.length, total })}
        </p>
        {loadFailed && (
          <div className="flex flex-wrap items-center gap-3">
            <ErrorMessage>{m.list_load_failed()}</ErrorMessage>
            <Button variant="outline" size="sm" onClick={loadMore}>
              <Icon icon="refresh" aria-hidden data-icon="inline-start" />
              {m.list_retry()}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
