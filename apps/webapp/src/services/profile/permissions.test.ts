import { describe, expect, it } from 'vitest';

import { sortPermissions } from './permissions';

describe('sortPermissions', () => {
  it('follows the order of PERMISSIONS and puts unknown permissions last', () => {
    expect(
      sortPermissions(['feature-flags:manage', 'retired:permission', 'collection:manage']),
    ).toEqual(['collection:manage', 'feature-flags:manage', 'retired:permission']);
  });
});
