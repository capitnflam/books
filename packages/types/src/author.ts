import { z } from 'zod'

import { dateInfoSchema } from './sub/date-info'
import { transformURI } from './sub/transform-uri'

const authorInternalSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const authorMinimalSchema = authorInternalSchema.transform(
  transformURI('/author'),
)

export const authorSchema = authorInternalSchema
  .merge(dateInfoSchema)
  .transform(transformURI('/author'))

export type AuthorMinimal = z.infer<typeof authorMinimalSchema>
export type Author = z.infer<typeof authorSchema>
