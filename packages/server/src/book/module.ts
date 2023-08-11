import { Module } from '@nestjs/common'

import { PrismaService } from '../prisma/service'

import { BookController } from './controller'
import { BookService } from './service'

@Module({
  providers: [BookService, PrismaService],
  controllers: [BookController],
})
export class BookModule {}
