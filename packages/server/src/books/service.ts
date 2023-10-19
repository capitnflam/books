import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import { Book, bookSchema } from '~books/types'

import { PrismaService } from '../prisma/service'

const newLineRegEx = /\\n/g

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async get(): Promise<Book[]> {
    const books = await this.prisma.book.findMany({
      include: { authors: true },
    })

    if (!books) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }

    const results = books.map((book) => {
      const result = bookSchema.parse(book)
      result.synopsis = result.synopsis?.replace(newLineRegEx, '\n')

      return result
    })

    return results
  }
}
