import { Module } from '@nestjs/common'

import { BookController } from './controller'
import { BookService } from './service'
import { PrismaService } from '../prisma/service'

@Module({
  providers: [BookService, PrismaService],
  controllers: [BookController],
})
export class BookModule {}
