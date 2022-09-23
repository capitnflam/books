import { RequestMethod } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Params } from 'nestjs-pino'

const getPinoConfiguration = async (
  config: ConfigService,
): Promise<Params> => ({
  pinoHttp: {
    level: config.get<string>('service.logLevel'),
    messageKey: 'message',
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    formatters: {
      level: (label: string) => ({ level: label }),
      log: (obj: any) => ({
        ...obj,
        responseTime: undefined,
        duration: obj.responseTime
          ? Number(obj.responseTime) / 1000
          : undefined,
      }),
    },
    base: {
      environment: config.get<string>('service.environment'),
      service: config.get<string>('service.name'),
    },
    redact: {
      paths: ['req.headers', 'res.headers'],
    },
  },
  exclude: [{ method: RequestMethod.ALL, path: '/healthz' }],
})

export default getPinoConfiguration
