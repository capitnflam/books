import {
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm'

import { FilterRule, Filtering } from '../../filtering-params'

function getWhereItem<Entity>(filter: Filtering<Entity>) {
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

export function getWhere<Entity>(
  filterArray?: Filtering<Entity>[],
): FindOptionsWhere<Entity> | undefined {
  if (!filterArray) {
    return undefined
  }

  return filterArray.reduce<FindOptionsWhere<Entity>>((acc, filter) => {
    const where = getWhereItem(filter)
    if (where) {
      return {
        ...acc,
        ...where,
      }
    }
    return acc
  }, {})
}
