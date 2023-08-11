import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../prisma/service'

import { BookController } from './controller'
import { BookService } from './service'

describe('BookController', () => {
  let controller: BookController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [BookService, PrismaService],
    }).compile()

    controller = module.get<BookController>(BookController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
