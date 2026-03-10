import { Controller, Get } from '@nestjs/common';
@Controller('updates')
export class UpdatesController {
  @Get('check') check() { return { latest: '0.1.0' }; }
  @Get('compatibility') compatibility() { return { windows: true, macos: true }; }
}
