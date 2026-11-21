import { describe, expect, it } from 'vitest';

import { fuzzyFilter } from './fuzzy-search';

const genres = [
  'Adventure',
  'Biography and memoir',
  'Children’s books',
  'Fantasy',
  'Historical fiction',
  'History',
  'Literary fiction',
  'Mystery',
  'Philosophy',
  'Science',
  'Science fiction',
  'Short stories',
  'Théâtre',
];

const search = (query: string) => fuzzyFilter(genres, query, (genre) => genre);

describe('fuzzyFilter', () => {
  it('keeps every item, in order, for an empty query', () => {
    expect(search('')).toEqual(genres);
    expect(search('   ')).toEqual(genres);
  });

  it('finds the start of a name or of any word in it, closest matches first', () => {
    expect(search('fan')).toEqual(['Fantasy']);
    expect(search('sci')).toEqual(['Science', 'Science fiction']);
    expect(search('hist')).toEqual(['History', 'Historical fiction']);
    expect(search('fic')).toEqual(['Historical fiction', 'Literary fiction', 'Science fiction']);
  });

  it('ignores case and accents', () => {
    expect(search('THEATRE')).toEqual(['Théâtre']);
    expect(search('childrens')).toEqual(['Children’s books']);
  });

  it('forgives a typo, putting the closest name first', () => {
    expect(search('fantsy')).toEqual(['Fantasy']);
    expect(search('fnatasy')).toEqual(['Fantasy']);
    expect(search('histry')).toEqual(['History']);
    expect(search('biograhpy')).toEqual(['Biography and memoir']);
    expect(search('filosophy')).toEqual(['Philosophy']);
    expect(search('mistery')[0]).toBe('Mystery');
  });

  it('finds nothing for unrelated or too-short scrambled queries', () => {
    expect(search('zzz')).toEqual([]);
    expect(search('qx')).toEqual([]);
    expect(search('fsy')).toEqual([]);
  });
});
