import { describe, it, expectTypeOf } from 'vitest';

import type { RemovePrefix } from './remove-prefix.type';

describe('type RemovePrefix', () => {
  it('should remove the specified prefix from the string type', () => {
    type Test = RemovePrefix<'PrefixString', 'Prefix'>;
    expectTypeOf<Test>().toExtend<'String'>();
  });

  it('should return the same string type if the prefix does not match', () => {
    type Test = RemovePrefix<'String', 'Prefix'>;
    expectTypeOf<Test>().toExtend<'String'>();
  });
});
