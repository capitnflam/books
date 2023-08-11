import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import { authorSchema, Author } from '~books/types'

import { PrismaService } from '../prisma/service'

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

  async get(id: number): Promise<Author> {
    const authorPromise = this.prisma.author.findUnique({ where: { id } })

    const author = await authorPromise
    if (!author) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }
    const dbResult = {
      ...author,
    }

    const result = authorSchema.parse(dbResult)

    return result
  }
}
