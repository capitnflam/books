import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class AppService {
  constructor(private readonly logger: Logger) {}

  getHello(): string {
    this.logger.debug('Hello World!')

    return 'Hello World!'
  }
}
