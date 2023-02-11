import { registerAs } from '@nestjs/config'

export type AuthConfiguration = {
  google: {
    clientID: string
    clientSecret: string
  }
}

export const CONFIG_TOKEN = 'auth'

const authConfigFactory = (): AuthConfiguration => ({
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
})

export const authConfig = registerAs(CONFIG_TOKEN, authConfigFactory)
