import { Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import serviceConfig from './config/service.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [serviceConfig],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
