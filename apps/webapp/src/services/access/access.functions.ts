import { createServerFn } from '@tanstack/react-start';

import { checkPermissionServer, getMyPermissionsServer } from './access.server';

import type { Permission } from '@books/database';

export const getMyPermissionsFn = createServerFn({ method: 'GET' }).handler(getMyPermissionsServer);

/** Route guard for `beforeLoad`; the server checks that `permission` is a known one. */
export const checkPermissionFn = createServerFn({ method: 'GET' })
  .validator((data: { permission: Permission; redirect_url?: string }) => ({
    permission: data.permission,
    redirect_url: data.redirect_url ?? '/',
  }))
  .handler(async ({ data }) => checkPermissionServer(data.permission, data.redirect_url));
