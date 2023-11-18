import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common'
import { Request } from 'express'

export interface Pagination {
  page: number
  limit: number
}

interface PaginationParamsInput {
  defaultValues?: Pagination
  maxLimit?: number
}

export const PaginationParams = createParamDecorator(
  (
    {
      defaultValues = { limit: 10, page: 1 },
      maxLimit = 100,
    }: PaginationParamsInput,
    ctx: ExecutionContext,
  ): Pagination => {
    const req: Request = ctx.switchToHttp().getRequest()
    let page = defaultValues.page
    let limit = defaultValues.limit

    try {
      page = parseInt(req.query.page as string)
    } catch (error) {
      page = defaultValues.page
    }

    try {
      limit = parseInt(req.query.limit as string)
    } catch (error) {
      limit = defaultValues.limit
    }

    // check if page and size are valid
    if (isNaN(page) || page < 0 || isNaN(limit) || limit < 0) {
      throw new BadRequestException('Invalid pagination params')
    }
    // do not allow to fetch large slices of the dataset
    if (limit > maxLimit) {
      throw new BadRequestException(
        `Invalid pagination params: Max limit is ${maxLimit}`,
      )
    }

    return { page, limit }
  },
)
