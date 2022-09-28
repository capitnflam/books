import { registerAs } from '@nestjs/config'

const logLevels = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
  'silent',
] as const
type LogLevel = typeof logLevels[number]

export type LoggerConfiguration = {
  environment: string
  logLevel: LogLevel
  name: string
}

const isLogLevel = (level: string): level is LogLevel =>
  (logLevels as unknown as string[]).includes(level)

const getLogLevel = (level?: string): LogLevel => {
  if (!level || !isLogLevel(level)) {
    return 'error'
  }

  return level
}

const loggerConfigFactory = (): LoggerConfiguration => ({
  environment: process.env.ENVIRONMENT || 'devlopment',
  logLevel: getLogLevel(process.env.LOG_LEVEL),
  name: process.env.SERVICE_NAME || 'books-server',
})

export const loggerConfig = registerAs('logger', loggerConfigFactory)
