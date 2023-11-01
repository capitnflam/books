import validator from 'validator'
import { z } from 'zod'

import { authorMinimalSchema } from './author'
import { dateInfoSchema } from './sub/date-info'
import { transformURI } from './sub/transform-uri'

const newLineRegEx = /\\n/g

const bookInternalSchema = z.object({
  id: z.number(),
  coverURL: z
    .string()
    .url()
    .nullish()
    .transform((x) => x ?? undefined),
  title: z.string(),
  isbn: z
    .string()
    .refine(validator.isISBN)
    .nullish()
    .transform((x) => x ?? undefined),
})

export const bookMinimalSchema = bookInternalSchema.transform(
  transformURI('/book'),
)

export const bookSchema = bookInternalSchema
  .merge(
    z.object({
      synopsis: z
        .string()
        .nullish()
        .transform((x) => x?.replace(newLineRegEx, '\n') ?? undefined),
      authors: z.array(authorMinimalSchema),
    }),
  )
  .merge(dateInfoSchema)
  .transform(transformURI('/book'))

export type BookMinimal = z.infer<typeof bookMinimalSchema>
export type Book = z.infer<typeof bookSchema>
