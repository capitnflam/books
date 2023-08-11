import { Controller, Get, Header, Param } from '@nestjs/common'

import { BookService } from './service'

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get(':id')
  @Header('Content-Type', 'application/json')
  async getBook(@Param('id') id: string) {
    return JSON.stringify(await this.bookService.get(Number.parseInt(id)))
  }
}
