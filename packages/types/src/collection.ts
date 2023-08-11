import { z } from 'zod'

import { dateInfoSchema } from './sub/date-info'
import { transformURI } from './sub/transform-uri'

import { bookMinimalSchema } from './book'

export const collectionSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    books: z.array(bookMinimalSchema),
  })
  .merge(dateInfoSchema)
  .transform(transformURI('/collection'))

export type Collection = z.infer<typeof collectionSchema>
