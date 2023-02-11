import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { AuthService } from './service'
import { CONFIG_TOKEN as AUTH_CONFIG_TOKEN, AuthConfiguration } from './config'
import { Logger } from '../logger'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private logger: Logger,
    private authService: AuthService,
  ) {
    const authConfig = configService.get<AuthConfiguration>(AUTH_CONFIG_TOKEN)
    if (!authConfig) {
      throw new Error('Failed to get auth configuration')
    }

    super({
      clientID: authConfig.google.clientID,
      clientSecret: authConfig.google.clientSecret,
      callbackURL: 'http://localhost:3000/auth/google/redirect',
      scope: ['email', 'profile'],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, photos } = profile
    const user = {
      email: emails?.[0].value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0].value,
      accessToken,
    }

    this.logger.debug(user, 'user info')

    done(null, user)
  }
}
