import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RuntimeService } from '../runtime/runtime.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly runtimeService: RuntimeService,
    private readonly prisma: PrismaService
  ) {}

  async gateway() {
    const status = await this.runtimeService.getStatus();
    return {
      status: status.healthy ? 'ok' : 'degraded',
      runtime: status
    };
  }

  async install() {
    const latestSession = await this.prisma.install_sessions.findFirst({
      orderBy: { updated_at: 'desc' }
    });

    return {
      status: 'ok',
      session: latestSession
        ? {
            id: latestSession.id,
            state: latestSession.state,
            updatedAt: latestSession.updated_at.toISOString()
          }
        : null
    };
  }
}
