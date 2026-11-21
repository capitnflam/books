import { GENRES as DATABASE_GENRES } from '@books/database';
import { describe, expect, it } from 'vitest';

import { GENRES, genresFromSubjects } from './genres';

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

  it('suggests nothing for subjects that name no genre', () => {
    expect(genresFromSubjects(['Rincewind', 'Discworld (Imaginary place)'])).toEqual([]);
    expect(genresFromSubjects([])).toEqual([]);
  });
});
