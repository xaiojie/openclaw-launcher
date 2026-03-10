import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('gateway')
  gateway() {
    return this.healthService.gateway();
  }

  @Get('install')
  install() {
    return this.healthService.install();
  }
}
