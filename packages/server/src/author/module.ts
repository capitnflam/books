import { Module } from '@nestjs/common'

import { AuthorController } from './controller'
import { AuthorService } from './service'
import { PrismaService } from '../prisma/service'

@Module({
  providers: [AuthorService, PrismaService],
  controllers: [AuthorController],
})
export class AuthorModule {}
