import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import serviceConfig from './config/service.config'
import getPinoConfiguration from './pino.configure'

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [serviceConfig],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getPinoConfiguration,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
