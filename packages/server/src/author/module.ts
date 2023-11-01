import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthorController } from './controller'
import { AuthorEntity } from './entity'
import { AuthorService } from './service'

@Module({
  imports: [TypeOrmModule.forFeature([AuthorEntity])],
  providers: [AuthorService],
  controllers: [AuthorController],
})
export class AuthorModule {}
