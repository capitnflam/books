import validator from 'validator'
import { z } from 'zod'

import { dateInfoSchema } from './sub/date-info'
import { transformURI } from './sub/transform-uri'

export const booksResultSchema = z.array(
  z
    .object({
      id: z.number(),
      authors: z.array(z.object({ id: z.number() })),
      title: z.string(),
      isbn: z
        .string()
        .refine(validator.isISBN)
        .nullish()
        .transform((x) => x ?? undefined),
    })
    .merge(dateInfoSchema)
    .transform(transformURI('/book'))
    .transform(({ authors, ...rest }) => ({
      ...rest,
      authors: authors.map(transformURI('/author')).map(({ uri }) => uri),
    })),
)

export type BooksResult = z.infer<typeof booksResultSchema>
