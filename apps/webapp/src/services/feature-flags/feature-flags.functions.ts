import { createServerFn } from '@tanstack/react-start';

import {
  createFeatureFlagSchema,
  flagDetailsSearchSchema,
  flagIdSchema,
  flagUsersSchema,
  updateFeatureFlagSchema,
} from './feature-flags';
import {
  createFeatureFlagServer,
  deleteFeatureFlagServer,
  getFeatureFlagDetailsServer,
  grantFeatureFlagServer,
  listFeatureFlagsServer,
  revokeFeatureFlagServer,
  updateFeatureFlagServer,
} from './feature-flags.server';

// Each handler checks the caller's permission itself: the route guards do not cover these.

export const listFeatureFlagsFn = createServerFn({ method: 'GET' }).handler(async () =>
  listFeatureFlagsServer(),
);

export const getFeatureFlagDetailsFn = createServerFn({ method: 'GET' })
  .validator(flagDetailsSearchSchema.extend(flagIdSchema.shape))
  .handler(async ({ data }) => getFeatureFlagDetailsServer(data));

export const createFeatureFlagFn = createServerFn({ method: 'POST' })
  .validator(createFeatureFlagSchema)
  .handler(async ({ data }) => createFeatureFlagServer(data));

export const updateFeatureFlagFn = createServerFn({ method: 'POST' })
  .validator(updateFeatureFlagSchema)
  .handler(async ({ data }) => updateFeatureFlagServer(data));

export const deleteFeatureFlagFn = createServerFn({ method: 'POST' })
  .validator(flagIdSchema)
  .handler(async ({ data }) => deleteFeatureFlagServer(data));

export const grantFeatureFlagFn = createServerFn({ method: 'POST' })
  .validator(flagUsersSchema)
  .handler(async ({ data }) => grantFeatureFlagServer(data));

export const revokeFeatureFlagFn = createServerFn({ method: 'POST' })
  .validator(flagUsersSchema)
  .handler(async ({ data }) => revokeFeatureFlagServer(data));
