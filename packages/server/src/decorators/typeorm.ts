import {
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm'

import { FilterRule, Filtering } from './filtering-params'
import { Sorting } from './sorting-params'

export function getOrder<Entity>(sort?: Sorting<Entity>) {
  return sort ? { [sort.property]: sort.direction } : undefined
}

export function getWhere<Entity>(filter?: Filtering<Entity>) {
  if (!filter) {
    return undefined
  }

  switch (filter.rule) {
    case FilterRule.IS_NULL:
      return { [filter.property]: IsNull() }
    case FilterRule.IS_NOT_NULL:
      return { [filter.property]: Not(IsNull()) }
    case FilterRule.EQUALS:
      return { [filter.property]: filter.value }
    case FilterRule.NOT_EQUALS:
      return { [filter.property]: Not(filter.value) }
    case FilterRule.GREATER_THAN:
      return { [filter.property]: MoreThan(filter.value) }
    case FilterRule.GREATER_THAN_OR_EQUALS:
      return { [filter.property]: MoreThanOrEqual(filter.value) }
    case FilterRule.LESS_THAN:
      return { [filter.property]: LessThan(filter.value) }
    case FilterRule.LESS_THAN_OR_EQUALS:
      return { [filter.property]: LessThanOrEqual(filter.value) }
    case FilterRule.LIKE:
      return { [filter.property]: ILike(`%${filter.value}%`) }
    case FilterRule.NOT_LIKE:
      return { [filter.property]: Not(ILike(`%${filter.value}%`)) }
    case FilterRule.IN:
      return { [filter.property]: In(filter.value.split(',')) }
    case FilterRule.NOT_IN:
      return { [filter.property]: Not(In(filter.value.split(','))) }
    default:
      return undefined
  }
}
