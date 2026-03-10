import { Body, Controller, Get, Post } from '@nestjs/common';
@Controller()
export class AuthController {
  @Post('auth/login') login(@Body() body: any) { return { token: 'demo-token', body }; }
  @Post('auth/register') register(@Body() body: any) { return { userId: 'u_demo', body }; }
  @Get('me') me() { return { id: 'u_demo', email: 'demo@openclaw.local' }; }
}
