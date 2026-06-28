import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
import { db, orm, schema } from '@repo/database'

import { getServerEnv } from '#/config/env'

async function getUserByIdServer(authenticationId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: orm.eq(schema.users.authenticationId, authenticationId),
    })

    return user
  } catch {
    return null
  }
}

async function insertUserServer(user: { authenticationId: string; displayName: string }) {
  try {
    const insertedUser = await db.insert(schema.users).values(user).returning()

    return insertedUser[0]
  } catch {
    return null
  }
}

export async function getAuthenticatedUserServer() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  let user = await getUserByIdServer(userId)

  if (!user) {
    const clerk = clerkClient({
      secretKey: getServerEnv().CLERK_SECRET_KEY,
    })

    const authenticatedUser = await clerk.users.getUser(userId)
    user = await insertUserServer({
      authenticationId: userId,
      displayName: authenticatedUser.fullName || '',
    })
  }

  return user
}
