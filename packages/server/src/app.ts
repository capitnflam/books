import { Global, Module } from '@nestjs/common'

import { AuthorModule } from './author'
import { BookModule } from './book'
import { ConfigModule } from './config'

@Global()
@Module({
  imports: [ConfigModule, BookModule, AuthorModule],
})
export class AppModule {}
