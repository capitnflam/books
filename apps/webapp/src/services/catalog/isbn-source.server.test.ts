import { describe, expect, it } from 'vitest';

import {
  cleanDescription,
  cleanSubjects,
  languageFromMarc,
  publishedFromText,
} from './isbn-source.server';

describe('publishedFromText', () => {
  it('keeps the full date when the day is known, else the year', () => {
    expect(publishedFromText('1991-09-21')).toBe('1991-09-21');
    expect(publishedFromText('Sep 21, 1991')).toBe('1991-09-21');
    expect(publishedFromText('21 September 1991')).toBe('1991-09-21');
    expect(publishedFromText('September 1991')).toBe('1991');
    expect(publishedFromText('1991-09')).toBe('1991');
    expect(publishedFromText('c1991')).toBe('1991');
    expect(publishedFromText('unknown')).toBeUndefined();
    expect(publishedFromText(undefined)).toBeUndefined();
  });
});

describe('languageFromMarc', () => {
  it('maps MARC codes to BCP 47 tags', () => {
    expect(languageFromMarc('/languages/fre')).toBe('fr');
    expect(languageFromMarc('/languages/xyz')).toBeUndefined();
  });
});

describe('cleanDescription', () => {
  it('leaves plain text', () => {
    expect(cleanDescription('<p>Bilbo goes <b>there</b>.</p>')).toBe('Bilbo goes there.');
    expect(cleanDescription('A *tale* of [adventure](https://example.org).')).toBe(
      'A tale of adventure.',
    );
    expect(cleanDescription('A tale.\r\n\r\n----------\nAlso contained in: …')).toBe('A tale.');
    expect(cleanDescription(undefined)).toBeUndefined();
  });
});

describe('cleanSubjects', () => {
  it('drops codes, headings and repeats', () => {
    expect(
      cleanSubjects(['Dragons', ' dragons ', 'nyt:children', 'Fiction, general', 'x'.repeat(41)]),
    ).toEqual(['Dragons']);
  });
});
