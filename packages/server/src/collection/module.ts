import { Module } from '@nestjs/common'

import { PrismaService } from '../prisma/service'

import { CollectionController } from './controller'
import { CollectionService } from './service'

@Module({
  providers: [CollectionService, PrismaService],
  controllers: [CollectionController],
})
export class CollectionModule {}
