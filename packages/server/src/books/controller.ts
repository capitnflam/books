import { Controller, Get, Header } from '@nestjs/common'

import { BooksService } from './service'

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  async getBook() {
    return JSON.stringify(await this.booksService.get())
  }
}
