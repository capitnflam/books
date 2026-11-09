import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { ERD_PATH, renderErd } from './erd.ts';
import * as schema from './schema.ts';

describe('generated ERD.md', () => {
  it('matches the schema (regenerate with `pnpm --filter @books/database run db:erd`)', () => {
    expect(existsSync(ERD_PATH), 'ERD.md is missing').toBe(true);
    expect(readFileSync(ERD_PATH, 'utf-8').replaceAll('\r\n', '\n')).toBe(renderErd(schema));
  });
});
