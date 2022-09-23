import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'

@Injectable()
export class AppService {
  constructor(private readonly logger: PinoLogger) {}

  getHello(): string {
    this.logger.debug({ meta: 42 }, 'Hello World!')

    return 'Hello World!'
  }
}
