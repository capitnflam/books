import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { FindOneOptions, Repository } from 'typeorm'

import { collectionSchema } from '~books/types'

import { addDays } from '../utils'

import { CollectionEntity } from './entity'
import { CollectionService } from './service'

const singleCollectionCreationDate = new Date()
const singleBookCreationDate = new Date()
const singleCollection = {
  createdAt: singleCollectionCreationDate,
  updatedAt: addDays(singleCollectionCreationDate, 1),
  id: 1,
  name: 'Test Collection',
  books: [
    {
      authors: [{ id: 1, name: 'Test Author 1' }],
      createdAt: singleBookCreationDate,
      updatedAt: addDays(singleBookCreationDate, 1),
      title: 'Test Book 1',
      id: 1,
      isbn: '978-0-596-52068-7',
      synopsis: 'Test Synopsis',
    },
    {
      authors: [
        { id: 1, name: 'Test Author 1' },
        { id: 2, name: 'Test Author 2' },
      ],
      createdAt: singleBookCreationDate,
      updatedAt: addDays(singleBookCreationDate, 1),
      title: 'Test Book 2',
      id: 2,
      isbn: '978-0-596-52068-7',
      synopsis: 'Test\n\n\n\nSynopsis',
    },
    {
      authors: [{ id: 1, name: 'Test Author' }],
      createdAt: singleBookCreationDate,
      updatedAt: addDays(singleBookCreationDate, 1),
      title: 'Test Book 3',
      id: 3,
      isbn: '978-0-596-52068-7',
      synopsis: 'Test Synopsis',
    },
  ],
}

const collectionList = [
  {
    createdAt: singleCollectionCreationDate,
    updatedAt: addDays(singleCollectionCreationDate, 1),
    id: 1,
    name: 'Test Collection',
    books: [
      {
        authors: [{ id: 1, name: 'Test Author 1' }],
        createdAt: singleBookCreationDate,
        updatedAt: addDays(singleBookCreationDate, 1),
        title: 'Test Book 1',
        id: 1,
        isbn: '978-0-596-52068-7',
        synopsis: 'Test Synopsis',
      },
      {
        authors: [
          { id: 1, name: 'Test Author 1' },
          { id: 2, name: 'Test Author 2' },
        ],
        createdAt: singleBookCreationDate,
        updatedAt: addDays(singleBookCreationDate, 1),
        title: 'Test Book 2',
        id: 2,
        isbn: '978-0-596-52068-7',
        synopsis: 'Test\n\n\n\nSynopsis',
      },
      {
        authors: [{ id: 1, name: 'Test Author' }],
        createdAt: singleBookCreationDate,
        updatedAt: addDays(singleBookCreationDate, 1),
        title: 'Test Book 3',
        id: 3,
        isbn: '978-0-596-52068-7',
        synopsis: 'Test Synopsis',
      },
    ],
  },
  {
    createdAt: singleCollectionCreationDate,
    updatedAt: addDays(singleCollectionCreationDate, 1),
    id: 2,
    name: 'Test Collection 2',
    books: [],
  },
]

describe('CollectionService', () => {
  let service: CollectionService
  let repository: Repository<CollectionEntity>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        {
          provide: getRepositoryToken(CollectionEntity),
          useValue: {
            find: vi.fn().mockResolvedValue(collectionList),
            findOne: vi
              .fn()
              .mockImplementation(
                (options: FindOneOptions<CollectionEntity>) => {
                  if (options.where?.['id'] === 1) {
                    return singleCollection
                  }
                  return null
                },
              ),
          },
        },
      ],
    }).compile()

    service = module.get<CollectionService>(CollectionService)
    repository = module.get<Repository<CollectionEntity>>(
      getRepositoryToken(CollectionEntity),
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return a single collection', async () => {
    const repositorySpy = vi.spyOn(repository, 'findOne')
    expect(service.get(1)).resolves.toEqual(
      collectionSchema.parse(singleCollection),
    )
    expect(repositorySpy).toBeCalledWith({
      where: { id: 1 },
      relations: ['books'],
    })
  })

  it('should rejects with a 404 http error if collection is not found', async () => {
    const repositorySpy = vi.spyOn(repository, 'findOne')
    expect(service.get(404)).rejects.toThrowError('Not Found')
    expect(repositorySpy).toBeCalledWith({
      where: { id: 404 },
      relations: ['books'],
    })
  })

  it('should return a list of collections', async () => {
    const repositorySpy = vi.spyOn(repository, 'find')
    expect(service.getAll()).resolves.toEqual(
      collectionList.map((data) => collectionSchema.parse(data)),
    )
    expect(repositorySpy).toBeCalled()
  })
})
