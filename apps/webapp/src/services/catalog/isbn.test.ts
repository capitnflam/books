import { describe, expect, it } from 'vitest';

import { normalizeIsbn, parseIsbn } from './isbn';

describe('normalizeIsbn', () => {
  it('drops the spaces and hyphens printed in an ISBN', () => {
    expect(normalizeIsbn(' 978-0-261-10221-7 ')).toBe('9780261102217');
    expect(normalizeIsbn('0 261 10221 4')).toBe('0261102214');
    expect(normalizeIsbn('080442957x')).toBe('080442957X');
  });
});

describe('parseIsbn', () => {
  it('reads an ISBN-13 and finds its ISBN-10', () => {
    expect(parseIsbn('978-0-261-10221-7')).toEqual({
      isbn13: '9780261102217',
      isbn10: '0261102214',
    });
  });

  it('reads an ISBN-10 and finds its ISBN-13', () => {
    expect(parseIsbn('0-261-10221-4')).toEqual({
      isbn13: '9780261102217',
      isbn10: '0261102214',
    });
  });

  it('accepts an ISBN-10 whose check digit is X', () => {
    expect(parseIsbn('0-8044-2957-x')).toEqual({ isbn13: '9780804429573', isbn10: '080442957X' });
  });

  it('gives a 979 ISBN-13 no ISBN-10', () => {
    expect(parseIsbn('979-10-90636-07-1')).toEqual({ isbn13: '9791090636071', isbn10: null });
  });

  it('refuses a wrong check digit, length or prefix', () => {
    expect(parseIsbn('9780261102218')).toBeNull();
    expect(parseIsbn('0261102215')).toBeNull();
    expect(parseIsbn('978026110221')).toBeNull();
    expect(parseIsbn('9770261102217')).toBeNull();
    expect(parseIsbn('X261102214')).toBeNull();
    expect(parseIsbn('')).toBeNull();
  });
});
