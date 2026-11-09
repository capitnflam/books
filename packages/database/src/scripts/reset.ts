import { reset } from 'drizzle-seed';

import { db } from '../db/index.ts';
import * as schema from '../db/schema.ts';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set: export it or add it to packages/database/.env.local.',
    );
  }

  await reset(db, schema);
}

await main();
