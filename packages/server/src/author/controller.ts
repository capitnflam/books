import { Controller, Get, Header, Param } from '@nestjs/common'

import { AuthorService } from './service'

@Controller('authors?')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  async getAuthors() {
    return this.authorService.getAll()
  }

  @Get(':id')
  @Header('Content-Type', 'application/json')
  async getAuthor(@Param('id') id: string) {
    return this.authorService.get(Number.parseInt(id))
  }
}
