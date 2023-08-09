import { Controller, Get, Param } from '@nestjs/common'
import { Book } from '@books/types'

import { BookService } from './service'

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get('foo')
  getFoo() {
    return '{"foo":42}'
  }

  @Get(':id')
  async getBook(@Param('id') id: string) {
    return JSON.stringify(await this.bookService.get(Number.parseInt(id)))
  }
}
