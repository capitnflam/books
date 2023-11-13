import { z } from 'zod'

import { dateInfoSchema } from './sub/date-info'
import { transformURI } from './sub/transform-uri'

const collectionCommonSchema = z.object({
  name: z.string(),
})

export const collectionResultSchema = z
  .object({
    id: z.number(),
    books: z.array(z.object({ id: z.number() })),
  })
  .merge(collectionCommonSchema)
  .merge(dateInfoSchema)
  .transform(transformURI('/collection'))
  .transform(({ books, ...rest }) => ({
    ...rest,
    books: books.map(transformURI('/book')).map(({ uri }) => uri),
  }))

export const collectionRequestSchema = z
  .object({
    uri: z.string().refine((x) => x.startsWith('/collection/')),
    books: z.array(z.string().refine((x) => x.startsWith('/book/'))),
  })
  .merge(collectionCommonSchema)

export type CollectionResult = z.infer<typeof collectionResultSchema>
export type CollectionRequest = z.infer<typeof collectionRequestSchema>
