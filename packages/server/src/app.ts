import { Global, Module } from '@nestjs/common'

import { AuthorModule } from './author'
import { BookModule } from './book'
import { BooksModule } from './books'
import { CollectionModule } from './collection'
import { ConfigModule } from './config'

@Global()
@Module({
  imports: [
    ConfigModule,
    BookModule,
    BooksModule,
    AuthorModule,
    CollectionModule,
  ],
})
export class AppModule {}
