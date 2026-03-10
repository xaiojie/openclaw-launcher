import { Body, Controller, Get, Post } from '@nestjs/common';
@Controller('usage')
export class UsageController {
  @Post('report') report(@Body() body: any) { return { accepted: true, body }; }
  @Get('summary') summary() { return { daily: [] }; }
}
