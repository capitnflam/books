import { m } from '#/paraglide/messages';

import type { Genre } from '@books/database';

// A Record over Genre, so adding a genre to the database's list fails the type check until it
// has a name here. The list itself stays in `@books/database`, which the browser can't import.
const genreLabels: Record<Genre, () => string> = {
  fantasy: m.genre_fantasy,
  science_fiction: m.genre_science_fiction,
  horror: m.genre_horror,
  mystery: m.genre_mystery,
  thriller: m.genre_thriller,
  crime: m.genre_crime,
  romance: m.genre_romance,
  historical_fiction: m.genre_historical_fiction,
  literary_fiction: m.genre_literary_fiction,
  classics: m.genre_classics,
  adventure: m.genre_adventure,
  young_adult: m.genre_young_adult,
  children: m.genre_children,
  humour: m.genre_humour,
  poetry: m.genre_poetry,
  drama: m.genre_drama,
  short_stories: m.genre_short_stories,
  comics: m.genre_comics,
  biography: m.genre_biography,
  history: m.genre_history,
  philosophy: m.genre_philosophy,
  science: m.genre_science,
  essays: m.genre_essays,
  travel: m.genre_travel,
};

/** Every genre, in the order of the database's list. */
export const GENRES = Object.keys(genreLabels) as [Genre, ...Genre[]];

/** A genre's name in the page's language. */
export const genreLabel = (genre: Genre) => genreLabels[genre]();

// Other words readers search a genre by, in each language: `theatre` for Drama, `scifi` for
// Science fiction. Comma-separated in the messages; genres without any are left out.
const genreAliasMessages: Partial<Record<Genre, () => string>> = {
  science_fiction: m.genre_science_fiction_aliases,
  horror: m.genre_horror_aliases,
  mystery: m.genre_mystery_aliases,
  thriller: m.genre_thriller_aliases,
  crime: m.genre_crime_aliases,
  romance: m.genre_romance_aliases,
  literary_fiction: m.genre_literary_fiction_aliases,
  classics: m.genre_classics_aliases,
  young_adult: m.genre_young_adult_aliases,
  children: m.genre_children_aliases,
  humour: m.genre_humour_aliases,
  poetry: m.genre_poetry_aliases,
  drama: m.genre_drama_aliases,
  short_stories: m.genre_short_stories_aliases,
  comics: m.genre_comics_aliases,
  biography: m.genre_biography_aliases,
  science: m.genre_science_aliases,
  essays: m.genre_essays_aliases,
  travel: m.genre_travel_aliases,
};

/** The words a genre is also found by in the page's language; never shown, only searched. */
export function genreAliases(genre: Genre): string[] {
  return (genreAliasMessages[genre]?.() ?? '')
    .split(',')
    .map((alias) => alias.trim())
    .filter(Boolean);
}

/** Words in a catalogue's subjects that point to a genre; the first genres found are suggested. */
const GENRE_HINTS: [Genre, RegExp][] = [
  ['science_fiction', /science[ -]fiction|sci-fi|space opera|dystopi/u],
  ['fantasy', /fantasy/u],
  ['horror', /horror|ghost stor/u],
  ['mystery', /myster|detective|whodunit/u],
  ['thriller', /thriller|suspense|espionage|spy stor/u],
  ['crime', /\bcrime\b|police procedural/u],
  ['romance', /romance|love stor/u],
  ['historical_fiction', /historical fiction|fiction \/ historical|fiction, historical/u],
  ['literary_fiction', /literary fiction|fiction \/ literary/u],
  ['classics', /classic/u],
  ['adventure', /adventure/u],
  ['young_adult', /young adult|\bteen/u],
  ['children', /children|juvenile|picture book/u],
  ['humour', /humou?r|satire|comic fiction/u],
  ['poetry', /poetry|poems/u],
  ['drama', /\bdrama\b|\bplays\b/u],
  ['short_stories', /short stor/u],
  ['comics', /comics|comic book|graphic novel|manga/u],
  ['biography', /biograph|memoir/u],
  ['philosophy', /philosoph/u],
  ['essays', /\bessays\b/u],
  ['travel', /\btravel/u],
];

/** Subjects about the real world, not a novel's setting: `History`, `Science / Physics`. */
const NONFICTION_HINTS: [Genre, RegExp][] = [
  ['history', /^history\b|\/ history\b/u],
  ['science', /^science\b|\/ science\b|popular science/u],
];

const SUGGESTED_GENRES_MAX = 3;

/**
 * The genres a book's subjects suggest, as written by a catalogue (`Fantasy fiction`,
 * `Fiction / Science Fiction / General`), most specific first and at most three.
 */
export function genresFromSubjects(subjects: readonly string[]): Genre[] {
  const lower = subjects.map((subject) => subject.toLowerCase());
  const fiction = lower.some((subject) => subject.includes('fiction'));
  const hints = fiction ? GENRE_HINTS : [...GENRE_HINTS, ...NONFICTION_HINTS];

  return hints
    .filter(([, pattern]) => lower.some((subject) => pattern.test(subject)))
    .map(([genre]) => genre)
    .slice(0, SUGGESTED_GENRES_MAX);
}
