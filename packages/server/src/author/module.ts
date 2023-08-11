import { Module } from '@nestjs/common'

import { PrismaService } from '../prisma/service'

import { AuthorController } from './controller'
import { AuthorService } from './service'

@Module({
  providers: [AuthorService, PrismaService],
  controllers: [AuthorController],
})
export class AuthorModule {}
