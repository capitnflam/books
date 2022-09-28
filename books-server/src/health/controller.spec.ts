import { TerminusModule } from '@nestjs/terminus'
import { Test, TestingModule } from '@nestjs/testing'

import { HealthController } from './controller'

describe('HealthController', () => {
  let controller: HealthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      imports: [TerminusModule],
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  it('should report health', () => {
    expect(controller.health()).toBeDefined()
  })
})
