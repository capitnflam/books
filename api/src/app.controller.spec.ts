import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    process.env.JWT_SECRET = '424242'
    app = await Test.createTestingModule({
      controllers: [AppController],
      imports: [AuthModule, UsersModule],
      providers: [AppService],
    }).compile()
  })

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const appController = app.get<AppController>(AppController)
      expect(appController.getHello()).toBe('Hello World!')
    })
  })
})
