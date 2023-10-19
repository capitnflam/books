import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import { Book, bookSchema } from '~books/types'

import { PrismaService } from '../prisma/service'

const newLineRegEx = /\\n/g

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  async get(id: number): Promise<Book> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { authors: true },
    })

    if (!book) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }

    const result = bookSchema.parse(book)

    result.synopsis = result.synopsis?.replace(newLineRegEx, '\n')

    return result
  }
}
