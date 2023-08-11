import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../prisma/service'

import { AuthorController } from './controller'
import { AuthorService } from './service'

describe('AuthorController', () => {
  let controller: AuthorController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorController],
      providers: [AuthorService, PrismaService],
    }).compile()

    controller = module.get<AuthorController>(AuthorController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
