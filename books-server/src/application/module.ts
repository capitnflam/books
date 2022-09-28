import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { HealthModule } from '../health'
import { LoggerModule } from '../logger'

import { ApplicationController } from './controller'
import { ApplicationService } from './service'
import { applicationConfig } from './config'

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [applicationConfig],
    }),
    LoggerModule,
    HealthModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
