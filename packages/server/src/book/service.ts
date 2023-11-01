import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Book, bookSchema } from '~books/types'

import { BookEntity } from './entity'

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly booksRepository: Repository<BookEntity>,
  ) {}

  async getAll(): Promise<Book[]> {
    const books = await this.booksRepository.find({ relations: ['authors'] })

    if (!books) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }

    const results = books.map((book) => bookSchema.parse(book))

    return results
  }

  async get(id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ['authors'],
    })

    if (!book) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }

    const result = bookSchema.parse(book)

    return result
  }
}
