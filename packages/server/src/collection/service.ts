import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import { collectionSchema, Collection } from '~books/types'

import { PrismaService } from '../prisma/service'

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async get(id: number): Promise<Collection> {
    const collectionPromise = this.prisma.collection.findUnique({
      where: { id },
    })
    const books = await collectionPromise.books({
      include: { book: true },
      orderBy: { index: 'asc' },
    })

    console.log(books)

    const collection = await collectionPromise
    if (!collection) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }
    const dbResult = {
      ...collection,
      books:
        books?.map((item) => {
          const { book } = item
          const { id, coverURL, title, isbn } = book

          return { id, coverURL, title, isbn }
        }) ?? [],
    }

    const result = collectionSchema.parse(dbResult)

    return result
  }
}
