import { z } from 'zod';

export const DISPLAY_NAME_MAX_LENGTH = 100;

export const displayNameSchema = z.object({
  displayName: z.string().trim().min(1).max(DISPLAY_NAME_MAX_LENGTH),
});
