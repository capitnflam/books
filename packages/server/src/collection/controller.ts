import { Controller, Get, Header, Param } from '@nestjs/common'

import { CollectionService } from './service'

@Controller('collections?')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  getCollections() {
    return this.collectionService.getAll()
  }

  @Get(':id')
  @Header('Content-Type', 'application/json')
  getCollection(@Param('id') id: string) {
    return this.collectionService.get(Number.parseInt(id))
  }
}
