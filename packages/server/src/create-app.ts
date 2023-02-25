import { NestFactory } from '@nestjs/core'

import { AppModule } from './app'

export function createApp() {
  return NestFactory.create(AppModule, { bufferLogs: true, bodyParser: true })
}
