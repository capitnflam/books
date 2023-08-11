import { z } from 'zod'

export const dateInfoSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z
    .date()
    .nullish()
    .transform((x) => x ?? undefined),
})
