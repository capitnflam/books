import { registerAs } from '@nestjs/config'

const logLevels = ['debug', 'verbose', 'log', 'warn', 'error'] as const
type LogLevel = typeof logLevels[number]

export type ServiceConfiguration = {
  logLevel: LogLevel
  port: number
}

const isLogLevel = (level: string): level is LogLevel =>
  (logLevels as unknown as string[]).includes(level)

const getLogLevel = (level?: string): LogLevel => {
  if (!level || !isLogLevel(level)) {
    return 'error'
  }

  return level
}

const serviceConfigFactory = (): ServiceConfiguration => ({
  logLevel: getLogLevel(process.env.LOG_LEVEL),
  port: Number(process.env.PORT) || 3000,
})

export default registerAs('service', serviceConfigFactory)
