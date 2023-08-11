import { z } from 'zod'

export const dateInfoSchema = z.object({
  createdAt: z.date().transform((x) => x.toISOString()),
  updatedAt: z.date().transform((x) => x.toISOString()),
  deletedAt: z
    .date()
    .nullish()
    .transform((x) => x?.toISOString() ?? undefined),
})
