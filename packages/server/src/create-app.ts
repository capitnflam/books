import { NestFactory } from '@nestjs/core'

import { AppModule } from './app'

export function createApp(bufferLogs = true) {
  return NestFactory.create(AppModule, { bufferLogs, bodyParser: true })
}
