import { Injectable } from '@nestjs/common'

import { Logger } from '../logger'

@Injectable()
export class ApplicationService {
  constructor(private readonly logger: Logger) {}

  getHello(): string {
    this.logger.debug({ meta: 42 }, 'Hello World!')

    return 'Hello World!'
  }

  googleLogin(req: any) {
    if (!req.user) {
      return 'No user from google'
    }

    return {
      message: 'User information from google',
      user: req.user,
    }
  }
}
