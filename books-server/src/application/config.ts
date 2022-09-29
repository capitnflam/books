import { registerAs } from '@nestjs/config'

export type ApplicationConfiguration = {
  port: number
  session: {
    salt: string
    secret: string
  }
}

export const CONFIG_TOKEN = 'application'

const applicationConfigFactory = (): ApplicationConfiguration => ({
  port: Number(process.env.PORT) || 3000,
  session: {
    salt: process.env.SESSION_SALT || '',
    secret: process.env.SESSION_SECRET || '',
  },
})

export const applicationConfig = registerAs(
  CONFIG_TOKEN,
  applicationConfigFactory,
)
