import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common'
import { Request } from 'express'

export interface Filtering<Entity> {
  property: keyof Entity
  rule: string
  value: string
}

// valid filter rules
export enum FilterRule {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  LIKE = 'like',
  NOT_LIKE = 'nlike',
  IN = 'in',
  NOT_IN = 'nin',
  IS_NULL = 'isnull',
  IS_NOT_NULL = 'isnotnull',
}

interface FilteringParamsInput<Entity> {
  defaultValues?: Filtering<Entity>[]
  allowedProperties: (keyof Entity)[]
}

const filterPatternValue =
  /^[a-zA-Z0-9_]+:(eq|neq|gt|gte|lt|lte|like|nlike|in|nin):[a-zA-Z0-9_,]+$/
const filterPatternNull = /^[a-zA-Z0-9_]+:(isnull|isnotnull)$/

export const FilteringParamsGenerator = <Entity>() =>
  createParamDecorator(
    (
      { defaultValues, allowedProperties }: FilteringParamsInput<Entity>,
      ctx: ExecutionContext,
    ): Filtering<Entity>[] | undefined => {
      const req: Request = ctx.switchToHttp().getRequest()
      let filterArray: string[] = req.query.filter as string[]
      const result: Filtering<Entity>[] = []
      if (!req.query.filter) {
        return defaultValues
      }

      if (!Array.isArray(req.query.filter)) {
        filterArray = [req.query.filter as string]
      }

      filterArray.forEach((filter) => {
        // validate the format of the filter, if the rule is 'isnull' or 'isnotnull' it don't need to have a value
        if (
          !filter.match(filterPatternValue) &&
          !filter.match(filterPatternNull)
        ) {
          throw new BadRequestException('Invalid filter parameter')
        }

        // extract the parameters and validate if the rule and the property are valid
        const [property, rule, value] = filter.split(':')
        const propertyCast = property as keyof Entity
        if (!allowedProperties.includes(propertyCast)) {
          throw new BadRequestException(`Invalid filter property: ${property}`)
        }
        if (!Object.values(FilterRule).includes(rule as FilterRule)) {
          throw new BadRequestException(`Invalid filter rule: ${rule}`)
        }
        result.push({ property: propertyCast, rule, value })
      })

      return result
    },
  )
