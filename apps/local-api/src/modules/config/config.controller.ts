import { Controller, Get, Post } from '@nestjs/common';
@Controller('config')
export class ConfigController {
  @Post('model') model() { return { ok: true }; }
  @Post('channel') channel() { return { ok: true }; }
  @Post('generate') generate() { return { files: ['openclaw.json', '.env'] }; }
  @Get('preview') preview() { return { json: '{"assistant":"demo"}', env: 'OPENCLAW_ENV=local' }; }
}
