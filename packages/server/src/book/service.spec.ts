import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../prisma/service'

import { BookService } from './service'

describe('BookService', () => {
  let service: BookService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookService, PrismaService],
    }).compile()

    service = module.get<BookService>(BookService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
