import { Body, Controller, Get, Post } from '@nestjs/common';
@Controller()
export class PlansController {
  @Get('plans') list() { return [{ id: 'starter', name: 'Starter' }]; }
  @Get('plans/recommended') recommended() { return [{ id: 'pro' }]; }
  @Post('plans/custom/quote') quote(@Body() body: any) { return { amount: 99, body }; }
}
