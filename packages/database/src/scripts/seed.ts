import { seed } from 'drizzle-seed'

import { db } from '../db/index.ts'
import { users } from '../db/schema.ts'

async function main() {
  console.log('Seeding database...')
  await seed(db, { users }).refine((f) => ({
    users: {
      columns: {
        id: undefined,
        name: f.fullName(),
        email: f.email(),
      },
      count: 3,
    },
  }))
}

await main()
