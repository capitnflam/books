import { z } from 'zod'

import { dateInfoSchema } from './sub/date-info'
import { transformURI } from './sub/transform-uri'

import { bookMinimalSchema } from './book'

const collectionInternalSchema = z.object({
  id: z.number(),
  name: z.string(),
  books: z.array(bookMinimalSchema),
})

export const collectionMinimalSchema = collectionInternalSchema.transform(
  transformURI('/collection'),
)

export const collectionSchema = collectionInternalSchema
  .merge(dateInfoSchema)
  .transform(transformURI('/collection'))

export type CollectionMinimal = z.infer<typeof collectionMinimalSchema>
export type Collection = z.infer<typeof collectionSchema>
