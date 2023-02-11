import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'

import { UsersModule } from '../users'

import { authConfig } from './config'
// import { LocalStrategy } from './local.strategy'
import { GoogleStrategy } from './google.strategy'
import { AuthService } from './service'

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: false,
      load: [authConfig],
    }),
    UsersModule,
    PassportModule,
  ],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
