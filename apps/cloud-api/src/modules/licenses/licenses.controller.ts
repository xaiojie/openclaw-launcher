import { Body, Controller, Get, Post } from '@nestjs/common';
@Controller('licenses')
export class LicensesController {
  @Post('activate') activate(@Body() body: any) { return { status: 'active', body }; }
  @Get('current') current() { return { key: 'LIC-DEMO', status: 'active' }; }
  @Post('heartbeat') heartbeat(@Body() body: any) { return { ok: true, body }; }
}
