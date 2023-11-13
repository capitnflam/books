import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  BookRequest,
  BookResult,
  BooksResult,
  bookResultSchema,
  booksResultSchema,
} from '~books/types'

import { BookEntity } from './entity'

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly booksRepository: Repository<BookEntity>,
  ) {}

  async getAll(): Promise<BooksResult> {
    const books = await this.booksRepository.find({
      select: { authors: { id: true } },
      relations: ['authors'],
    })

    if (!books) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }

    const results = booksResultSchema.parse(books)

    return results
  }

  async get(id: number): Promise<BookResult> {
    const book = await this.booksRepository.findOne({
      select: {
        authors: { id: true },
      },
      where: { id },
      relations: ['authors'],
    })

    if (!book) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }

    const result = bookResultSchema.parse(book)

    return result
  }

  async update(id: number, data: BookRequest): Promise<BookResult> {
    const { uri, authors, ...rest } = data
    await this.booksRepository.save({
      ...rest,
      id: Number.parseInt(uri.slice('/book/'.length)),
      authors: authors.map((author) => ({
        id: Number.parseInt(author.slice('/author/'.length)),
      })),
    })

    return this.get(id)
  }
}
