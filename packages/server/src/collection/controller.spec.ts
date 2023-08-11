import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../prisma/service'

import { CollectionController } from './controller'
import { CollectionService } from './service'

describe('BookController', () => {
  let controller: CollectionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [CollectionService, PrismaService],
    }).compile()

    controller = module.get<CollectionController>(CollectionController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
