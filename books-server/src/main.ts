import csrf from '@fastify/csrf-protection'
import helmet from '@fastify/helmet'
import secureSession from '@fastify/secure-session'
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
      cors: true,
    },
  )

  const configService = app.get(ConfigService)
  const serviceConfig = configService.get<ServiceConfiguration>('service')
  if (!serviceConfig) {
    throw new Error('Failed to get service configuration')
  }

  const logger = app.get<LoggerService>(Logger)
  app.useLogger(logger)
  app.enableVersioning({
    type: VersioningType.URI,
  })
  app.useGlobalPipes(new ValidationPipe())

  await app.register(helmet)
  await app.register(secureSession, {
    salt: serviceConfig.session.salt,
    secret: serviceConfig.session.secret,
  })
  await app.register(csrf, { sessionPlugin: '@fastify/secure-session' })

  await app.listen(serviceConfig.port).then(() => {
    logger.log(`Listening on port: ${serviceConfig.port}`)
  })
}
bootstrap()
