import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RuntimeLogsQueryDto } from './dto/logs.dto';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRuntimeLogs(query: RuntimeLogsQueryDto) {
    const limit = query.limit ?? 200;
    const logs = await this.prisma.runtime_logs.findMany({
      where: query.installSessionId
        ? {
            install_session_id: query.installSessionId
          }
        : undefined,
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    });

    return {
      logs: logs.map((item: any) => ({
        id: item.id,
        source: item.source,
        level: item.level,
        stage: item.stage,
        message: item.message,
        createdAt: item.created_at.toISOString(),
        installSessionId: item.install_session_id,
        runtimeInstanceId: item.runtime_instance_id
      }))
    };
  }
}
