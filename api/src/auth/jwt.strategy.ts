import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'

import { ExtractJwt, Strategy } from 'passport-jwt'

import { AuthConfigService } from '../config/auth/config.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authConfigService: AuthConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfigService.jwtSecret,
      signOptions: {
        expiresIn: '60s',
      },
    })
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username }
  }
}
