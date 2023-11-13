import { z } from 'zod'

import { dateInfoSchema } from './sub/date-info'
import { transformURI } from './sub/transform-uri'

const authorCommonSchema = z.object({
  name: z.string(),
})

export const authorResultSchema = z
  .object({
    id: z.number(),
  })
  .merge(authorCommonSchema)
  .merge(dateInfoSchema)
  .transform(transformURI('/author'))

export const authorRequestSchema = z
  .object({
    uri: z.string().refine((x) => x.startsWith('/author/')),
  })
  .merge(authorCommonSchema)

export type AuthorResult = z.infer<typeof authorResultSchema>
export type AuthorRequest = z.infer<typeof authorRequestSchema>
