import { Test, TestingModule } from '@nestjs/testing'

import { AuthorController } from './controller'
import { AuthorService } from './service'

describe('AuthorController', () => {
  let controller: AuthorController
  let service: AuthorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorController],
      providers: [
        AuthorService,
        {
          provide: AuthorService,
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

    controller = module.get<AuthorController>(AuthorController)
    service = module.get<AuthorService>(AuthorService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  // TODO: write tests
  it('should return a list of authors', async () => {
    expect(controller.getAuthors()).resolves.toEqual('[]')
    expect(service.getAll).toBeCalled()
  })
})
