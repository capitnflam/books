import { Controller, Get, Header, Param } from '@nestjs/common'

import { AuthorService } from './service'

@Controller('authors?')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  getAuthors() {
    return this.authorService.getAll()
  }

  @Get(':id')
  @Header('Content-Type', 'application/json')
  getAuthor(@Param('id') id: string) {
    return this.authorService.get(Number.parseInt(id))
  }
}
