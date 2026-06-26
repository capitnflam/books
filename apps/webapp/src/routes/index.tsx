import { db } from '@repo/database'
import { createFileRoute } from '@tanstack/react-router'

import HeaderUser from '#/integrations/clerk/header-user'

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const user = await db.query.users.findFirst()

    return {
      user,
    }
  },
  head: ({ loaderData }) => ({
    meta:
      loaderData?.user && loaderData.user.name
        ? [
            {
              title: `Welcome ${loaderData.user.name} to TanStack Start`,
            },
          ]
        : undefined,
  }),
})

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <HeaderUser />
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
    </div>
  )
}
