import { Test, TestingModule } from '@nestjs/testing'

import { BookController } from './controller'
import { BookService } from './service'

describe('BookController', () => {
  let controller: BookController
  let service: BookService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        BookService,
        {
          provide: BookService,
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

    controller = module.get<BookController>(BookController)
    service = module.get<BookService>(BookService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  // TODO: write tests
  it('should return a list of books', async () => {
    expect(controller.getBooks()).resolves.toEqual('[]')
    expect(service.getAll).toBeCalled()
  })
})
