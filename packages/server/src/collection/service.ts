import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Collection, collectionSchema } from '~books/types'

import { CollectionEntity } from './entity'

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(CollectionEntity)
    private readonly collectionsRepository: Repository<CollectionEntity>,
  ) {}

  async getAll(): Promise<Collection[]> {
    const collections = await this.collectionsRepository.find({
      relations: ['books'],
    })

    if (!collections) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }

    const results = collections.map((collection) =>
      collectionSchema.parse(collection),
    )

    return results
  }

  async get(id: number): Promise<Collection> {
    const collection = await this.collectionsRepository.findOne({
      where: { id },
      relations: ['books'],
    })

    if (!collection) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }
    const result = collectionSchema.parse(collection)

    return result
  }
}
