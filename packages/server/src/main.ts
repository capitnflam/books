import helmet from 'helmet'

import { ConfigService } from './config'
import { corsMatcher } from './cors-matcher'
import { createApp } from './create-app'

async function bootstrap() {
  const app = await createApp()
  app.use(helmet())

  const configService = app.get(ConfigService)
  app.enableCors({
    origin: (origin: string | undefined) => {
      if (process.env.NODE_ENV === 'development') {
        return true
      }
      return configService
        .get('allow-origin')
        .some((allowedOrigin) => corsMatcher(origin, allowedOrigin))
    },
  })

  const port = configService.get('port')
  const addr = configService.get('listen')

  await app.listen(port, addr)
}

void bootstrap()
