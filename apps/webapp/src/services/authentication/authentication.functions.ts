import { createServerFn } from '@tanstack/react-start'

import { checkIsAuthenticatedServer } from './authentication.server'

export const checkIsAuthenticatedFn = createServerFn({ method: 'GET' })
  .validator((data: { redirect_url?: string } = { redirect_url: '/' }) => data)
  .handler(async ({ data }) => {
    return checkIsAuthenticatedServer(data.redirect_url)
  })
