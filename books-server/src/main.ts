import helmet from '@fastify/helmet'
import { LoggerService, ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { Logger } from 'nestjs-pino'

import { AppModule } from './app.module'
import { ServiceConfiguration } from './config/service.config'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
    },
  )

  const configService = app.get(ConfigService)
  const serviceConfig = configService.get<ServiceConfiguration>('service')
  if (!serviceConfig) {
    throw new Error('Failed to get service configuration')
  }

  const logger = app.get<LoggerService>(Logger)
  app.useLogger(logger)
  app.register(helmet)
  app.enableVersioning({
    type: VersioningType.URI,
  })
  app.useGlobalPipes(new ValidationPipe())

  await app.listen(serviceConfig.port).then(() => {
    logger.log(`Listening on port: ${serviceConfig.port}`)
  })
}
bootstrap()
