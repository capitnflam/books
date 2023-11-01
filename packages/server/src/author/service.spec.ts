import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { FindOneOptions, Repository } from 'typeorm'

import { authorSchema } from '~books/types'

import { addDays } from '../utils'

import { AuthorEntity } from './entity'
import { AuthorService } from './service'

const singleAuthorCreationDate = new Date()
const singleAuthor = {
  createdAt: singleAuthorCreationDate,
  updatedAt: addDays(singleAuthorCreationDate, 1),
  id: 1,
  name: 'Test Author',
}

const authorList = [
  {
    createdAt: singleAuthorCreationDate,
    updatedAt: addDays(singleAuthorCreationDate, 1),
    id: 1,
    name: 'Test Author 1',
  },
  {
    createdAt: singleAuthorCreationDate,
    updatedAt: addDays(singleAuthorCreationDate, 1),
    id: 2,
    name: 'Test Author 2',
  },
]

describe('AuthorService', () => {
  let service: AuthorService
  let repository: Repository<AuthorEntity>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorService,
        {
          provide: getRepositoryToken(AuthorEntity),
          useValue: {
            find: vi.fn().mockResolvedValue(authorList),
            findOne: vi
              .fn()
              .mockImplementation((options: FindOneOptions<AuthorEntity>) => {
                if (options.where?.['id'] === 1) {
                  return singleAuthor
                }
                return null
              }),
          },
        },
      ],
    }).compile()

    service = module.get<AuthorService>(AuthorService)
    repository = module.get<Repository<AuthorEntity>>(
      getRepositoryToken(AuthorEntity),
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return a single author', async () => {
    const repositorySpy = vi.spyOn(repository, 'findOne')
    expect(service.get(1)).resolves.toEqual(authorSchema.parse(singleAuthor))
    expect(repositorySpy).toBeCalledWith({
      where: { id: 1 },
    })
  })

  it('should rejects with a 404 http error if author is not found', async () => {
    const repositorySpy = vi.spyOn(repository, 'findOne')
    expect(service.get(404)).rejects.toThrowError('Not Found')
    expect(repositorySpy).toBeCalledWith({
      where: { id: 404 },
    })
  })

  it('should return a list of authors', async () => {
    const repositorySpy = vi.spyOn(repository, 'find')
    expect(service.getAll()).resolves.toEqual(
      authorList.map((data) => authorSchema.parse(data)),
    )
    expect(repositorySpy).toBeCalled()
  })
})
