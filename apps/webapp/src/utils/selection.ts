/** Rows changed in one call of a bulk server function; a bigger selection goes in several. */
export const BULK_MAX = 100;

/** `ids` in batches the bulk server functions accept. */
export function inBulkBatches(ids: readonly string[]): string[][] {
  const batches: string[][] = [];

  for (let start = 0; start < ids.length; start += BULK_MAX) {
    batches.push(ids.slice(start, start + BULK_MAX));
  }

  return batches;
}

/**
 * Whether every item of `visible` is in `selected` (`true`), some are (`'some'`) or none
 * (`false`): the state of a "select all" checkbox over a list.
 */
export function selectionState(selected: ReadonlySet<string>, visible: readonly string[]) {
  const count = visible.filter((id) => selected.has(id)).length;

  if (count === 0) {
    return false;
  }

  return count === visible.length ? true : 'some';
}
