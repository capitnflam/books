import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'

import { AppModule } from './app'

export function createApp(bufferLogs = true) {
  return NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs,
    bodyParser: true,
  })
}
