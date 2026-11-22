/**
 * The genres a book can be filed under: a fixed list, so the catalogue can be browsed by it and
 * the app can name each one in every language. Subjects (`subjects`) hold the free-text topics.
 * Removing one here does not remove existing `book_genres` rows: delete them in a migration.
 */
export const GENRES = [
  'fantasy',
  'science_fiction',
  'horror',
  'mystery',
  'thriller',
  'crime',
  'romance',
  'historical_fiction',
  'literary_fiction',
  'classics',
  'adventure',
  'young_adult',
  'children',
  'humour',
  'poetry',
  'drama',
  'short_stories',
  'comics',
  'biography',
  'history',
  'philosophy',
  'science',
  'essays',
  'travel',
] as const;

export type Genre = (typeof GENRES)[number];
