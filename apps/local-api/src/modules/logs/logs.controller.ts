import { Controller, Get } from '@nestjs/common';
@Controller('logs')
export class LogsController { @Get('runtime') runtime() { return { logs: [] }; } }
