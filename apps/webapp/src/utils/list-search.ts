import { z } from 'zod';

/** Rows loaded at a time as a list scrolls. */
export const PAGE_SIZE = 25;

const SEARCH_MAX_LENGTH = 100;

/** One page of a searchable list: the text to look for (optional) and the page, from 1. */
export const listSearchSchema = z.object({
  q: z.string().trim().min(1).max(SEARCH_MAX_LENGTH).optional(),
  page: z.number().int().min(1).optional(),
});

export type ListSearch = z.infer<typeof listSearchSchema>;

/**
 * Reads a list's search param from the URL. A malformed value is dropped rather than failing
 * the page, and an empty one is left out so plain links to the list need none. The router reads
 * a query of digits (an ISBN) as a number.
 */
export function parseListSearch(search: Record<string, unknown>): { q?: string } {
  const q =
    typeof search.q === 'string' || typeof search.q === 'number' ? String(search.q).trim() : '';

  return { q: q.slice(0, SEARCH_MAX_LENGTH) || undefined };
}

/** Escapes `%`, `_` and `\` so a search matches them literally in a SQL `LIKE` pattern. */
export const escapeLike = (value: string) => value.replaceAll(/[%_\\]/gu, (char) => `\\${char}`);

/** The page to load after `loadedPages` pages of a `total`-row list, or none when all are in. */
export const nextPage = (loadedPages: number, total: number) =>
  loadedPages * PAGE_SIZE < total ? loadedPages + 1 : undefined;
