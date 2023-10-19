import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../prisma/service'

import { BooksService } from './service'

describe('BookService', () => {
  let service: BooksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BooksService, PrismaService],
    }).compile()

    service = module.get<BooksService>(BooksService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
