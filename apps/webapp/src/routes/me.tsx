import { UserProfile } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'

import { checkIsAuthenticatedFn } from '#/services/authentication/authentication.functions'

export const Route = createFileRoute('/me')({
  beforeLoad: async ({ location }) => {
    await checkIsAuthenticatedFn({ data: { redirect_url: location.href } })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <UserProfile />
    </div>
  )
}
