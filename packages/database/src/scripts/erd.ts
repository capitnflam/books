import { writeFileSync } from 'node:fs';

import { ERD_PATH, renderErd } from '../db/erd.ts';
import * as schema from '../db/schema.ts';

writeFileSync(ERD_PATH, renderErd(schema));
console.log(`Wrote ${ERD_PATH}`);
