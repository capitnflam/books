import { reset } from "drizzle-seed";

import { db } from "../db/index.ts";
import * as schema from "../db/schema.ts";

async function main() {
  await reset(db, schema);
}

await main();
