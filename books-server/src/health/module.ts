import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'

import { HealthController } from './controller'
import { healthConfig } from './config'

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [healthConfig],
    }),
    TerminusModule,
  ],
})
export class HealthModule {}
