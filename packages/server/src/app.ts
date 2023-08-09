import { Global, Module } from '@nestjs/common'

import { BookModule } from './book'
import { ConfigModule } from './config'

@Global()
@Module({
  imports: [ConfigModule, BookModule],
})
export class AppModule {}
