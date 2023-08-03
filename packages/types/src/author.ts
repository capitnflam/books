import { z } from 'zod'

export const authorSchema = z.object({
  uri: z.string().startsWith('/author/'),
  name: z.string(),
})

export type Author = z.infer<typeof authorSchema>
