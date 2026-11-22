import { fromBnf } from './isbn-bnf.server';
import { fromGoogleBooks } from './isbn-google-books.server';
import { fromNdl } from './isbn-ndl.server';
import { fromOpenLibrary } from './isbn-open-library.server';
import { compact } from './isbn-source.server';

import type { BookDraft } from './catalog';
import type { Isbns } from './isbn';

export type LookupOutcome =
  | { status: 'found'; draft: BookDraft }
  | { status: 'not-found' }
  /** The source most likely to know it failed (network error, outage): trying again may work. */
  | { status: 'unavailable' };

/** Details that only make sense with the field they belong to. */
const DETAILS = [
  ['title', 'subtitle'],
  ['series', 'seriesPosition'],
] as const;

/**
 * One draft from what each source found: the first one wins each field and later ones fill the
 * gaps. A subtitle or a position in the series comes only from a source that agrees on the title
 * or series it goes with.
 */
export function mergeDrafts(drafts: readonly BookDraft[]): BookDraft {
  const merged: BookDraft = Object.assign({}, ...drafts.toReversed());

  for (const [field, detail] of DETAILS) {
    const value = merged[field]?.toLowerCase();

    merged[detail] = drafts.find(
      (draft) => draft[detail] !== undefined && draft[field]?.toLowerCase() === value,
    )?.[detail];
  }

  return compact(merged);
}

/** ISBNs of the French-language group (France, Belgium, Quebec…) and, in `979`, of France. */
const isFrench = ({ isbn13 }: Isbns) => /^(?:9782|97910)/u.test(isbn13);

/** ISBNs of the Japanese group. */
const isJapanese = ({ isbn13 }: Isbns) => isbn13.startsWith('9784');

/**
 * Finds a book by ISBN in the open catalogues: first the national library of France or Japan when
 * the ISBN is one of theirs, then Open Library, then Google Books (when an API key is configured:
 * it refuses anonymous requests) for the fields the others lack.
 */
export async function lookupIsbnOnline(
  isbns: Isbns,
  { googleBooksApiKey }: { googleBooksApiKey?: string } = {},
): Promise<LookupOutcome> {
  const sources = [
    ...(isFrench(isbns) ? [fromBnf(isbns)] : []),
    ...(isJapanese(isbns) ? [fromNdl(isbns)] : []),
    fromOpenLibrary(isbns),
    ...(googleBooksApiKey ? [fromGoogleBooks(isbns, googleBooksApiKey)] : []),
  ];
  const results = await Promise.allSettled(sources);
  const drafts = results.flatMap((result) =>
    result.status === 'fulfilled' && result.value ? [result.value] : [],
  );

  if (drafts.length === 0) {
    return results[0]?.status === 'rejected' ? { status: 'unavailable' } : { status: 'not-found' };
  }

  return { status: 'found', draft: mergeDrafts(drafts) };
}
