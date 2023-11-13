import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  CollectionResult,
  CollectionsResult,
  collectionResultSchema,
  collectionsResultSchema,
} from '~books/types'

import { CollectionEntity } from './entity'

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(CollectionEntity)
    private readonly collectionsRepository: Repository<CollectionEntity>,
  ) {}

  async getAll(): Promise<CollectionsResult> {
    const collections = await this.collectionsRepository.find({
      relations: ['books'],
    })

    if (!collections) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }

    const results = collectionsResultSchema.parse(collections)

    return results
  }

  async get(id: number): Promise<CollectionResult> {
    const collection = await this.collectionsRepository.findOne({
      where: { id },
      relations: ['books'],
    })

    if (!collection) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }
    const result = collectionResultSchema.parse(collection)

    return result
  }
}
