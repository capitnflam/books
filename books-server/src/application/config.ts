import { registerAs } from '@nestjs/config'

export type ApplicationConfiguration = {
  port: number
}

export const CONFIG_TOKEN = 'application'

const applicationConfigFactory = (): ApplicationConfiguration => ({
  port: Number(process.env.PORT) || 3000,
})

export const applicationConfig = registerAs(
  CONFIG_TOKEN,
  applicationConfigFactory,
)
