import { registerAs } from '@nestjs/config'

export type DatabaseConfiguration = {
  type: 'sqlite'
  url: string
}

const databaseConfigFactory = (): DatabaseConfiguration => ({
  type: 'sqlite',
  url: process.env.DATABASE_URL || '',
})

export default registerAs('database', databaseConfigFactory)
