import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema.ts';

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const db: NodePgDatabase<typeof schema> = drizzle(process.env.DATABASE_URL!, { schema });
