import { createFileRoute } from '@tanstack/react-router'

import HeaderUser from '#/integrations/clerk/header-user'
import { getAuthenticatedUserFn } from '#/services/users/users.functions'

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const user = await getAuthenticatedUserFn()

    return { user }
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.user
      ? [
          {
            title: `Welcome ${loaderData.user.displayName} to TanStack Start`,
          },
        ]
      : undefined,
  }),
})

function Home() {
  const { user } = Route.useLoaderData()
  return (
    <div>
      <h1>Welcome to TanStack Start {user?.displayName}</h1>
      <div>
        <HeaderUser />
      </div>
      <p>
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
    </div>
  )
}
