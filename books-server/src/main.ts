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

import { ApplicationConfiguration, ApplicationModule } from './application'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ApplicationModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
      cors: true,
    },
  )

  const configService = app.get(ConfigService)
  const applicationConfig =
    configService.get<ApplicationConfiguration>('application')
  if (!applicationConfig) {
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
    salt: applicationConfig.session.salt,
    secret: applicationConfig.session.secret,
  })
  await app.register(csrf, { sessionPlugin: '@fastify/secure-session' })

  app.enableShutdownHooks()

  await app.listen(applicationConfig.port).then(() => {
    logger.log(`Listening on port: ${applicationConfig.port}`)
  })
}

bootstrap()
