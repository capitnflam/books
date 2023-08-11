import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import { bookSchema, Book } from '~books/types'

import { PrismaService } from '../prisma/service'

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  async get(id: number): Promise<Book> {
    const bookPromise = this.prisma.book.findUnique({ where: { id } })
    const authors = await bookPromise.authors()

    const book = await bookPromise
    if (!book) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }
    const dbResult = {
      ...book,
      authors: authors ?? [],
    }

    const result = bookSchema.parse(dbResult)

    return result
  }
}
