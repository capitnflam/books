import { Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule as PinoLoggerModule, Params } from 'nestjs-pino'

import { loggerConfig } from './config'

const getPinoConfiguration = (config: ConfigService): Params => ({
  pinoHttp: {
    level: config.get<string>('logger.logLevel'),
    messageKey: 'message',
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    formatters: {
      level: (label: string) => ({ level: label }),
      log: (obj: Record<string, unknown>): Record<string, unknown> => ({
        ...obj,
        responseTime: undefined,
        duration: obj.responseTime
          ? Number(obj.responseTime) / 1000
          : undefined,
      }),
    },
    base: {
      environment: config.get<string>('logger.environment'),
      service: config.get<string>('logger.name'),
    },
    redact: {
      paths: ['req.headers', 'res.headers'],
    },
  },
  exclude: [{ method: RequestMethod.ALL, path: '/healthz' }],
})

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [loggerConfig],
    }),
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getPinoConfiguration,
    }),
  ],
})
export class LoggerModule {}
