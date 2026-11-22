import { GENRES as DATABASE_GENRES } from '@books/database';
import { describe, expect, it } from 'vitest';

import { fuzzyFilter } from '#/utils/fuzzy-search';

import { GENRES, genreAliases, genreLabel, genresFromSubjects } from './genres';

/** The genre a reader typing `query` in the genre field gets first. */
const bestMatch = (query: string) => fuzzyFilter(GENRES, query, genreLabel, genreAliases)[0];

describe('the genre list', () => {
  it('lists the database’s genres, in its order', () => {
    expect(GENRES).toEqual(DATABASE_GENRES);
  });
});

describe('genresFromSubjects', () => {
  it('finds genres in the way catalogues word their subjects', () => {
    expect(genresFromSubjects(['Fantasy fiction', 'Dragons', 'Wizards'])).toEqual(['fantasy']);
    expect(genresFromSubjects(['Fiction / Science Fiction / Space Opera'])).toEqual([
      'science_fiction',
    ]);
    expect(genresFromSubjects(['Detective and mystery stories', 'Fiction'])).toEqual(['mystery']);
    expect(genresFromSubjects(['Juvenile fiction', 'Humorous stories'])).toEqual([
      'children',
      'humour',
    ]);
  });

  it('suggests at most three, the more specific first', () => {
    expect(
      genresFromSubjects([
        'Classic literature',
        'Adventure stories',
        'Fantasy fiction',
        'Science fiction',
        'Horror tales',
      ]),
    ).toEqual(['science_fiction', 'fantasy', 'horror']);
  });

  it('suggests history and science only for non-fiction', () => {
    expect(genresFromSubjects(['History', 'Europe'])).toEqual(['history']);
    expect(genresFromSubjects(['Science / Physics'])).toEqual(['science']);
    expect(genresFromSubjects(['Great Britain / History', 'Historical fiction'])).toEqual([
      'historical_fiction',
    ]);
  });

  it('doesn’t take nonfiction for fiction', () => {
    expect(genresFromSubjects(['History / Europe / General', 'Juvenile Nonfiction'])).toEqual([
      'children',
      'history',
    ]);
    expect(genresFromSubjects(['Non-fiction', 'Science / Astronomy'])).toEqual(['science']);
  });

  it('suggests nothing for subjects that name no genre', () => {
    expect(genresFromSubjects(['Rincewind', 'Discworld (Imaginary place)'])).toEqual([]);
    expect(genresFromSubjects([])).toEqual([]);
  });
});

describe('genreAliases', () => {
  it('splits a genre’s aliases, and gives none to a genre without any', () => {
    expect(genreAliases('drama')).toEqual(['theatre', 'theater', 'plays']);
    expect(genreAliases('history')).toEqual([]);
  });

  it('lets readers find a genre by the words they use for it', () => {
    expect(bestMatch('theatre')).toBe('drama');
    expect(bestMatch('plays')).toBe('drama');
    expect(bestMatch('scifi')).toBe('science_fiction');
    expect(bestMatch('sci-fi')).toBe('science_fiction');
    expect(bestMatch('kids')).toBe('children');
    expect(bestMatch('manga')).toBe('comics');
    expect(bestMatch('YA')).toBe('young_adult');
  });

  it('still prefers a genre whose name matches', () => {
    expect(bestMatch('crime')).toBe('crime');
    expect(bestMatch('poetry')).toBe('poetry');
  });
});
