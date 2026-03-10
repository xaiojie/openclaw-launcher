import { Controller, Get, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { RuntimeLogsQueryDto } from './dto/logs.dto';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('runtime')
  runtime(@Query() query: RuntimeLogsQueryDto) {
    return this.logsService.getRuntimeLogs(query);
  }
}
