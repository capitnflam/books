import Fuse from 'fuse.js';

/**
 * The items matching `query` by their label, best matches first (Fuse.js), forgiving typos and
 * ignoring case and accents: `mistery` finds Mystery, `theatre` finds Théâtre. Items that
 * match equally well keep their order; an empty query keeps every item.
 */
export function fuzzyFilter<T>(
  items: readonly T[],
  query: string,
  label: (item: T) => string,
): T[] {
  const search = query.trim();

  if (!search) {
    return [...items];
  }

  const fuse = new Fuse(
    items.map((item) => ({ item, label: label(item) })),
    {
      keys: ['label'],
      ignoreDiacritics: true,
      // Match anywhere in the label, not only near its start: `fic` finds Science fiction.
      ignoreLocation: true,
      // 0 is an exact match and 1 anything. 0.3 lets a typo through (`fantsy`, `mistery`) but
      // not noise: at 0.35, `fan` also matched "Biography and memoir" and `fsy` Fantasy.
      // Abbreviations (`scifi`) aren't fuzzy matches for Fuse at any useful threshold.
      threshold: 0.3,
    },
  );

  return fuse.search(search).map(({ item }) => item.item);
}
