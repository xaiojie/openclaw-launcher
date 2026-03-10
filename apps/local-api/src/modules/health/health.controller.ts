import { Controller, Get } from '@nestjs/common';
@Controller('health')
export class HealthController { @Get('gateway') gateway() { return { status: 'ok' }; } @Get('install') install() { return { status: 'ok' }; } }
