import { describe, expect, it } from 'vitest';

import { initialsOf, localeName } from './names';

describe('localeName', () => {
  it('names each language in itself, capitalised', () => {
    expect(localeName('en')).toBe('English');
    expect(localeName('de')).toBe('Deutsch');
    expect(localeName('fr')).toBe('Français');
  });
});

describe('initialsOf', () => {
  it('keeps the first two initials', () => {
    expect(initialsOf('Jorge Luis Borges')).toBe('JL');
  });

  it('ignores extra spaces and returns nothing for a blank name', () => {
    expect(initialsOf('  mary   shelley ')).toBe('MS');
    expect(initialsOf('')).toBe('');
  });
});
