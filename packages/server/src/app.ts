import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthorModule } from './author'
import { BookModule } from './book'
import { CollectionModule } from './collection'
import { ConfigModule, ConfigService } from './config'

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: 'default',
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('database-url'),
        // TODO: set synchronize to false in production
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    BookModule,
    AuthorModule,
    CollectionModule,
  ],
})
export class AppModule {}
