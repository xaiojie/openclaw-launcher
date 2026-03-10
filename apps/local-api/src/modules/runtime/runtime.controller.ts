import { Controller, Get, Post } from '@nestjs/common';
import { RuntimeService } from './runtime.service';

@Controller('runtime')
export class RuntimeController {
  constructor(private readonly runtimeService: RuntimeService) {}

  @Get('status')
  status() {
    return this.runtimeService.getStatus();
  }

  @Post('start')
  start() {
    return this.runtimeService.start();
  }

  @Post('stop')
  stop() {
    return this.runtimeService.stop();
  }

  @Post('restart')
  restart() {
    return this.runtimeService.restart();
  }
}
