import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { FindOneOptions, Repository } from 'typeorm'

import { bookSchema } from '~books/types'

import { addDays } from '../utils'

import { BookEntity } from './entity'
import { BookService } from './service'

const singleBookCreationDate = new Date()
const singleBook = {
  authors: [{ id: 1, name: 'Test Author' }],
  createdAt: singleBookCreationDate,
  updatedAt: addDays(singleBookCreationDate, 1),
  title: 'Test Book',
  id: 1,
  isbn: '978-0-596-52068-7',
  synopsis: 'Test Synopsis',
}

const bookList = [
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
]

describe('BookService', () => {
  let service: BookService
  let repository: Repository<BookEntity>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getRepositoryToken(BookEntity),
          useValue: {
            find: vi.fn().mockResolvedValue(bookList),
            findOne: vi
              .fn()
              .mockImplementation((options: FindOneOptions<BookEntity>) => {
                if (options.where?.['id'] === 1) {
                  return singleBook
                }
                return null
              }),
          },
        },
      ],
    }).compile()

    service = module.get<BookService>(BookService)
    repository = module.get<Repository<BookEntity>>(
      getRepositoryToken(BookEntity),
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return a single book', async () => {
    const repositorySpy = vi.spyOn(repository, 'findOne')
    expect(service.get(1)).resolves.toEqual(bookSchema.parse(singleBook))
    expect(repositorySpy).toBeCalledWith({
      where: { id: 1 },
      relations: ['authors'],
    })
  })

  it('should rejects with a 404 http error if book is not found', async () => {
    const repositorySpy = vi.spyOn(repository, 'findOne')
    expect(service.get(404)).rejects.toThrowError('Not Found')
    expect(repositorySpy).toBeCalledWith({
      where: { id: 404 },
      relations: ['authors'],
    })
  })

  it('should return a list of books', async () => {
    const repositorySpy = vi.spyOn(repository, 'find')
    expect(service.getAll()).resolves.toEqual(
      bookList.map((data) => bookSchema.parse(data)),
    )
    expect(repositorySpy).toBeCalled()
  })
})
