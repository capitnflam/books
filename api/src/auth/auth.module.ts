import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AuthConfigModule } from '../config/auth/config.module'
import { AuthConfigService } from '../config/auth/config.service'
import { UsersModule } from '../users/users.module'

import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { LocalStrategy } from './local.strategy'

@Module({
  exports: [AuthService],
  imports: [
    AuthConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [AuthConfigModule],
      useFactory: async (authConfigService: AuthConfigService) => ({
        secret: authConfigService.jwtSecret,
        signOptions: { expiresIn: '60s' },
      }),
      inject: [AuthConfigService],
    }),
    UsersModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
