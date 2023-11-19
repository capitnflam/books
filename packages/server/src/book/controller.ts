import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common'
import { ZodValidationPipe } from 'nestjs-zod'

import { BookRequest, bookRequestSchema } from '~books/types'

import {
  Filtering,
  FilteringParamsGenerator,
} from '../decorators/filtering-params'
import { Pagination, PaginationParams } from '../decorators/pagination-params'
import { Sorting, SortingParamsGenerator } from '../decorators/sorting-params'

import { BookEntity } from './entity'
import { BookService } from './service'

const SortingParams = SortingParamsGenerator<BookEntity>()
const FilteringParams = FilteringParamsGenerator<BookEntity>()

@Controller('books?')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  getBooks(
    @PaginationParams({ defaultValues: { limit: 10, page: 1 } })
    pagination: Pagination,
    @SortingParams({
      allowedProperties: [
        'createdAt',
        'deletedAt',
        'id',
        'isbn',
        'updatedAt',
        'title',
      ],
    })
    sort?: Sorting<BookEntity>[],
    @FilteringParams({
      allowedProperties: [
        'createdAt',
        'deletedAt',
        'isbn',
        'synopsis',
        'title',
        'updatedAt',
      ],
    })
    filter?: Filtering<BookEntity>[],
  ) {
    return this.bookService.getAll(pagination, sort, filter)
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
