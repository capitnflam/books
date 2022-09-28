import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus'

import { HealthConfiguration } from './config'

@Controller('health')
export class HealthController {
  constructor(
    private readonly config: ConfigService,
    private readonly healthService: HealthCheckService,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  health() {
    const healthConfig = this.config.get<HealthConfiguration>('health')
    const healthIndicators = []

    if (healthConfig) {
      if (healthConfig.memoryLimits.heap) {
        const limitValue = healthConfig.memoryLimits.heap
        healthIndicators.push(() =>
          this.memoryHealthIndicator.checkHeap('memory_heap', limitValue),
        )
      }
      if (healthConfig.memoryLimits.rss) {
        const limitValue = healthConfig.memoryLimits.rss
        healthIndicators.push(() =>
          this.memoryHealthIndicator.checkHeap('memory_rss', limitValue),
        )
      }
    }

    return this.healthService.check(healthIndicators)
  }
}
