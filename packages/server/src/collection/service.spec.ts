import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../prisma/service'

import { CollectionService } from './service'

describe('CollectionService', () => {
  let service: CollectionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectionService, PrismaService],
    }).compile()

    service = module.get<CollectionService>(CollectionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
