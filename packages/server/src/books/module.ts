import { Module } from '@nestjs/common'

import { PrismaService } from '../prisma/service'

import { BooksController } from './controller'
import { BooksService } from './service'

@Module({
  providers: [BooksService, PrismaService],
  controllers: [BooksController],
})
export class BooksModule {}
