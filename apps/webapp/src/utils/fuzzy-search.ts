import Fuse from 'fuse.js';

/**
 * The items matching `query` by their label or, failing that, one of their aliases (other words
 * they are known by), best matches first (Fuse.js). Typos are forgiven and case and accents
 * ignored: `mistery` finds Mystery, `theatre` finds Théâtre. Items that match equally well keep
 * their order; an empty query keeps every item.
 */
export function fuzzyFilter<T>(
  items: readonly T[],
  query: string,
  label: (item: T) => string,
  aliases: (item: T) => readonly string[] = () => [],
): T[] {
  const search = query.trim();

  if (!search) {
    return [...items];
  }

  const fuse = new Fuse(
    items.map((item) => ({ item, label: label(item), aliases: aliases(item) })),
    {
      // A match on the label counts twice as much as one on an alias.
      keys: [
        { name: 'label', weight: 2 },
        { name: 'aliases', weight: 1 },
      ],
      ignoreDiacritics: true,
      // Match anywhere in the label, not only near its start: `fic` finds Science fiction.
      ignoreLocation: true,
      // 0 is an exact match and 1 anything. 0.3 lets a typo through (`fantsy`, `mistery`) but
      // not noise: at 0.35, `fan` also matched "Biography and memoir" and `fsy` Fantasy.
      // Abbreviations (`scifi`) aren't fuzzy matches for Fuse: give them as aliases.
      threshold: 0.3,
    },
  );

  return fuse.search(search).map(({ item }) => item.item);
}
