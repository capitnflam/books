import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AuthConfigService } from './config.service'
import configuration from './configuration'
import validation from './validation'

@Module({
  exports: [ConfigService, AuthConfigService],
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: validation,
    }),
  ],
  providers: [ConfigService, AuthConfigService],
})
export class AuthConfigModule {}
