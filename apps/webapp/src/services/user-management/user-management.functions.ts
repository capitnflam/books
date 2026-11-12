import { createServerFn } from '@tanstack/react-start';

import {
  userBlockedSchema,
  userDisplayNameSchema,
  userIdSchema,
  userListSearchSchema,
  userRoleSchema,
} from './user-management';
import {
  deleteUserServer,
  getUserDetailsServer,
  listUsersServer,
  setRoleServer,
  setUserBlockedServer,
  updateUserDisplayNameServer,
} from './user-management.server';

// Each handler checks the caller's permission itself: the route guards do not cover these.

export const listUsersFn = createServerFn({ method: 'GET' })
  .validator(userListSearchSchema)
  .handler(async ({ data }) => listUsersServer(data));

export const getUserDetailsFn = createServerFn({ method: 'GET' })
  .validator(userIdSchema)
  .handler(async ({ data }) => getUserDetailsServer(data.userId));

export const setRoleFn = createServerFn({ method: 'POST' })
  .validator(userRoleSchema)
  .handler(async ({ data }) => setRoleServer(data));

export const updateUserDisplayNameFn = createServerFn({ method: 'POST' })
  .validator(userDisplayNameSchema)
  .handler(async ({ data }) => updateUserDisplayNameServer(data));

export const setUserBlockedFn = createServerFn({ method: 'POST' })
  .validator(userBlockedSchema)
  .handler(async ({ data }) => setUserBlockedServer(data));

export const deleteUserFn = createServerFn({ method: 'POST' })
  .validator(userIdSchema)
  .handler(async ({ data }) => deleteUserServer(data));
