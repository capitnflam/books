import { FindOptionsOrder } from 'typeorm'

import { Sorting } from '../../sorting-params'

export function getOrder<Entity>(
  sortArray?: Sorting<Entity>[],
): FindOptionsOrder<Entity> | undefined {
  return sortArray
    ? sortArray.reduce<FindOptionsOrder<Entity>>((acc, sort) => {
        return {
          ...acc,
          [sort.property]: sort.direction,
        }
      }, {})
    : undefined
}
