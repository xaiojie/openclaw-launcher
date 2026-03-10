import { Controller, Get, Post } from '@nestjs/common';
@Controller('runtime')
export class RuntimeController {
  @Get('status') status() { return { running: false, state: 'stopped' }; }
  @Post('start') start() { return { ok: true }; }
  @Post('stop') stop() { return { ok: true }; }
  @Post('restart') restart() { return { ok: true }; }
}
