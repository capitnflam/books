import helmet from '@fastify/helmet'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston'
import * as winston from 'winston'

import { AppModule } from './app.module'
import { ServiceConfiguration } from './config/service.config'

async function bootstrap() {
  const transports = {
    console: new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike(),
        winston.format.prettyPrint({ colorize: true }),
      ),
      level: 'error',
    }),
  }
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: WinstonModule.createLogger({
        levels: winston.config.npm.levels,
        transports: [transports.console],
      }),
    },
  )
  const configService = app.get(ConfigService)
  const serviceConfig = configService.get<ServiceConfiguration>('service')
  if (!serviceConfig) {
    throw new Error('Failed to get service configuration')
  }
  transports.console.level = serviceConfig.logLevel
  app.register(helmet)
  await app.listen(serviceConfig.port)
}
bootstrap()
