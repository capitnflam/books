import { Controller, Get, Header, Param } from '@nestjs/common'

import { CollectionService } from './service'

@Controller('collections?')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  async getCollections() {
    return JSON.stringify(await this.collectionService.getAll())
  }

  @Get(':id')
  @Header('Content-Type', 'application/json')
  async getCollection(@Param('id') id: string) {
    return JSON.stringify(await this.collectionService.get(Number.parseInt(id)))
  }
}
