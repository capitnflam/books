import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { refusedFields } from './form-validation';

describe('refusedFields', () => {
  const errorsOf = refusedFields(
    z.object({
      key: z
        .string()
        .min(3)
        .regex(/^[A-Z]+$/u),
      description: z.string().max(5),
    }),
  );

  it('names each refused field once', () => {
    expect([...errorsOf({ key: 'a', description: 'too long' })]).toEqual(['key', 'description']);
  });

  it('names none when the schema accepts the values', () => {
    expect(errorsOf({ key: 'ABC', description: '' }).size).toBe(0);
  });
});
