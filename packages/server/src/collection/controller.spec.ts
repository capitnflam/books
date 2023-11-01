import { Test, TestingModule } from '@nestjs/testing'

import { CollectionController } from './controller'
import { CollectionService } from './service'

describe('CollectionController', () => {
  let controller: CollectionController
  let service: CollectionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [
        CollectionService,
        {
          provide: CollectionService,
          useValue: {
            getAll: vi.fn().mockImplementation(() => {
              return []
            }),
            get: vi.fn().mockImplementation(() => {
              return {}
            }),
          },
        },
      ],
    }).compile()

    controller = module.get<CollectionController>(CollectionController)
    service = module.get<CollectionService>(CollectionService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  // TODO: write tests
  it('should return a list of collections', async () => {
    expect(controller.getCollections()).resolves.toEqual('[]')
    expect(service.getAll).toBeCalled()
  })
})
