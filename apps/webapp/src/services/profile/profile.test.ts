import { describe, expect, it } from 'vitest';

import { displayNameSchema } from './profile';

describe('displayNameSchema', () => {
  it('trims the display name', () => {
    expect(displayNameSchema.parse({ displayName: '  Ada Lovelace ' })).toEqual({
      displayName: 'Ada Lovelace',
    });
  });

  it('rejects a blank or too long display name', () => {
    expect(displayNameSchema.safeParse({ displayName: '   ' }).success).toBe(false);
    expect(displayNameSchema.safeParse({ displayName: 'a'.repeat(101) }).success).toBe(false);
  });
});
