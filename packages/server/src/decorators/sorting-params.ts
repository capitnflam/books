import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common'
import { Request } from 'express'

const validDirectionsConst = ['asc', 'desc'] as const
type ValidDirections = (typeof validDirectionsConst)[number]
const validDirections = validDirectionsConst as unknown as string[]

function isDirection(direction: string): direction is ValidDirections {
  return validDirections.includes(direction)
}

export interface Sorting<Entity> {
  property: keyof Entity
  direction: ValidDirections
}

interface SortingParamsInput<Entity> {
  defaultValues?: Sorting<Entity>
  allowedProperties: (keyof Entity)[]
}

export const SortingParamsGenerator = <Entity>() =>
  createParamDecorator<SortingParamsInput<Entity>>(
    (
      { allowedProperties, defaultValues }: SortingParamsInput<Entity>,
      ctx: ExecutionContext,
    ): Sorting<Entity> | undefined => {
      const req: Request = ctx.switchToHttp().getRequest()
      const sort = req.query.sort as string
      if (!sort) {
        return defaultValues
      }

      // check the format of the sort query param
      const sortPattern = /^([a-zA-Z0-9]+):(asc|desc)$/
      if (!sort.match(sortPattern)) {
        throw new BadRequestException('Invalid sort parameter')
      }
      // extract the property name and direction and check if they are valid
      const [property, direction] = sort.split(':')
      if (!direction || !isDirection(direction)) {
        throw new BadRequestException(
          `Invalid sort direction: ${direction}. Valid directions are: ${validDirections.join(
            ', ',
          )}`,
        )
      }
      const propertyCast = property as keyof Entity
      if (!allowedProperties.includes(propertyCast)) {
        throw new BadRequestException(`Invalid sort property: ${property}`)
      }

      return { property: propertyCast, direction }
    },
  )
