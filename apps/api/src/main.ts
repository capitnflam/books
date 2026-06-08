import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(process.env.PORT ?? 3000)
}
// @ts-expect-error ts(1309) - Top-level await is not available when targeting ECMAScript modules. --- IGNORE ---
await bootstrap()
