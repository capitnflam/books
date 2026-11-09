// Server only: the database package's entry also loads the Postgres client.
import { PERMISSIONS } from '@books/database';

/** A permission's place in `PERMISSIONS`; one no longer in the code goes last. */
const rank = (permission: string) => {
  const index = (PERMISSIONS as readonly string[]).indexOf(permission);

  return index === -1 ? PERMISSIONS.length : index;
};

/**
 * A role's permissions in the order `PERMISSIONS` lists them, from a reader's own collection
 * up to administration. A permission no longer in the code goes last.
 */
export function sortPermissions<T extends string>(permissions: T[]): T[] {
  return permissions.toSorted((a, b) => rank(a) - rank(b));
}
