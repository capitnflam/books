import { createServerFn } from '@tanstack/react-start';

import { displayNameSchema } from './profile';
import { getProfileServer, updateDisplayNameServer } from './profile.server';

export const getProfileFn = createServerFn({ method: 'GET' }).handler(getProfileServer);

export const updateDisplayNameFn = createServerFn({ method: 'POST' })
  .validator(displayNameSchema)
  .handler(async ({ data }) => updateDisplayNameServer(data.displayName));
