import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

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
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
