import { describe, expect, it } from 'vitest';

import { formatDay, formatYear } from './dates';

describe('formatDay', () => {
  it('writes out the day itself, whatever the time zone', () => {
    expect(formatDay('1937-09-21')).toBe('September 21, 1937');
  });
});

describe('formatYear', () => {
  it('leaves a year of the common era as it is', () => {
    expect(formatYear(1937)).toBe('1937');
  });

  it('writes earlier years with their era', () => {
    expect(formatYear(-800)).toBe('800 BC');
    expect(formatYear(-1)).toBe('1 BC');
  });
});
