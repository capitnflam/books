import { DataSource } from 'typeorm'

import { AuthorEntity } from '../author'
import { BookEntity } from '../book'
import { CollectionEntity } from '../collection'

export default new DataSource({
  type: 'postgres',
  url: process.env.BOOKS_SERVER_DATABASE_URL,
  entities: [AuthorEntity, BookEntity, CollectionEntity],
  migrations: ['src/typeorm/migrations/*.ts'],
})
