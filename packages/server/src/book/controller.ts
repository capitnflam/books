import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common'
import { ZodValidationPipe } from 'nestjs-zod'

import { BookRequest, bookRequestSchema } from '~books/types'

import { BookService } from './service'

@Controller('books?')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  getBooks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.bookService.getAll({
      page,
      limit,
    })
  }

  @Get(':id')
  @Header('Content-Type', 'application/json')
  getBook(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.get(id)
  }

  @Put(':id')
  @Header('Content-Type', 'application/json')
  updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(bookRequestSchema)) body: BookRequest,
  ) {
    return this.bookService.update(id, body)
  }
}
