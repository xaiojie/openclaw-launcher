import { Module } from '@nestjs/common';
import { RuntimeModule } from '../runtime/runtime.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [RuntimeModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService]
})
export class HealthModule {}
