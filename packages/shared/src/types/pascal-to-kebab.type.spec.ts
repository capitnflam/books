import { describe, it, expectTypeOf } from 'vitest';

import type { PascalToKebab } from './pascal-to-kebab.type';

describe('type PascalToKebab', () => {
  it('should convert PascalCase to kebab-case', () => {
    type Test = PascalToKebab<'PascalCaseString'>;
    expectTypeOf<Test>().toExtend<'pascal-case-string'>();
  });

  it('should return the same string if it is already kebab-case', () => {
    type Test = PascalToKebab<'kebab-case-string'>;
    expectTypeOf<Test>().toExtend<'kebab-case-string'>();
  });
});
