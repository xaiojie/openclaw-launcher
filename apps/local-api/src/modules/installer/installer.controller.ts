import { Controller, Get, Param, Post } from '@nestjs/common';
import { InstallerService } from './installer.service';

@Controller('install')
export class InstallerController {
  constructor(private readonly service: InstallerService) {}

  @Post('session')
  createSession() {
    return this.service.createSession();
  }

  @Post('session/:id/start')
  start(@Param('id') id: string) {
    return this.service.start(id);
  }

  @Get('session/:id/status')
  status(@Param('id') id: string) {
    return this.service.getStatus(id);
  }
}
