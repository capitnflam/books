import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CollectionController } from './controller'
import { CollectionEntity } from './entity'
import { CollectionService } from './service'

@Module({
  imports: [TypeOrmModule.forFeature([CollectionEntity])],
  providers: [CollectionService],
  controllers: [CollectionController],
})
export class CollectionModule {}
