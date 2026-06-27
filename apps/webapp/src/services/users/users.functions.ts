import { createServerFn } from '@tanstack/react-start'

import { getUserByIdServer, getAuthenticatedUserServer } from './users.server'

export const getUserByIdFn = createServerFn({ method: 'GET' })
  .validator((data: { authenticationId: string }) => data)
  .handler(async ({ data }) => {
    return getUserByIdServer(data.authenticationId)
  })

export const getAuthenticatedUserFn = createServerFn({ method: 'GET' }).handler(
  getAuthenticatedUserServer,
)
