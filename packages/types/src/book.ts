import validator from 'validator'
import { z } from 'zod'

export const bookSchema = z.object({
  uri: z.string().startsWith('/book/'),
  coverURL: z.string().url().optional(),
  title: z.string(),
  synopsis: z.string().optional(),
  isbn: z.string().refine(validator.isISBN),
  authors: z.array(
    z.object({
      name: z.string(),
      uri: z.string().startsWith('/author/'),
    }),
  ),
})

export type Book = z.infer<typeof bookSchema>
