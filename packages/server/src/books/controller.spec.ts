import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../prisma/service'

import { BooksController } from './controller'
import { BooksService } from './service'

describe('BookController', () => {
  let controller: BooksController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [BooksService, PrismaService],
    }).compile()

    controller = module.get<BooksController>(BooksController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
