import { NestFactory } from '@nestjs/core'

import * as helmet from 'helmet'

import { AppModule } from './app.module'

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule)
  app.use(helmet())
  await app.listen(3000)
}

bootstrap()
