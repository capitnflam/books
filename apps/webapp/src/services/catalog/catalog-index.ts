import { z } from 'zod';

import { listSearchSchema, parseListSearch } from '#/utils/list-search';
import { BULK_MAX } from '#/utils/selection';

/** What books are filed under, each listed on the catalogue index. Genres are a fixed list. */
export const INDEX_KINDS = ['authors', 'series', 'publishers', 'subjects'] as const;

export type IndexKind = (typeof INDEX_KINDS)[number];

const kindSchema = z.enum(INDEX_KINDS);

/** One page of the entries of a kind, or of only those no book uses. */
export const listIndexSchema = listSearchSchema.extend({
  kind: kindSchema,
  unused: z.boolean().optional(),
});

export type ListIndexInput = z.output<typeof listIndexSchema>;

export const indexEntriesSchema = z.object({
  kind: kindSchema,
  ids: z.array(z.uuid()).min(1).max(BULK_MAX),
});

export type IndexEntriesInput = z.output<typeof indexEntriesSchema>;

/** Reads the index page's search params from the URL; malformed ones are dropped. */
export function parseIndexSearch(search: Record<string, unknown>): {
  kind?: IndexKind;
  q?: string;
  unused?: true;
} {
  return {
    kind: kindSchema.safeParse(search.kind).data,
    ...parseListSearch(search),
    unused: search.unused === true || undefined,
  };
}
