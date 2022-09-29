import { registerAs } from '@nestjs/config'

export type HealthConfiguration = {
  memoryLimits: {
    heap?: number
    rss?: number
  }
}

export const CONFIG_TOKEN = 'health'

const healthConfigFactory = (): HealthConfiguration => ({
  memoryLimits: {
    heap: Number(process.env.MEMORY_LIMIT_HEAP) || undefined,
    rss: Number(process.env.MEMORY_LIMIT_RSS) || undefined,
  },
})

export const healthConfig = registerAs(CONFIG_TOKEN, healthConfigFactory)
