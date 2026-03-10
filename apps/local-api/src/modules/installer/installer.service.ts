import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InstallLogItem, InstallSessionStatus, InstallState } from '@openclaw/shared-types';
import {
  DependencyChecker,
  OpenClawInstaller,
  ProcessSpawner,
  运行日志事件
} from '../../../../../packages/runtime-manager/src';
import { PrismaService } from '../../prisma/prisma.service';
import { RuntimeService } from '../runtime/runtime.service';

const INSTALL_STEPS: Array<{ state: InstallState; message: string }> = [
  { state: 'INIT', message: '安装会话已创建' },
  { state: 'CHECK_OS', message: '正在检查系统版本' },
  { state: 'CHECK_ENV', message: '正在检查运行环境依赖' },
  { state: 'INSTALL_OPENCLAW', message: '正在安装 OpenClaw 运行环境' },
  { state: 'START_GATEWAY', message: '正在启动 OpenClaw Gateway' },
  { state: 'HEALTH_CHECK', message: '正在执行运行健康检测' },
  { state: 'DONE', message: '安装完成' }
];

@Injectable()
export class InstallerService {
  private readonly logger = new Logger(InstallerService.name);
  private readonly runningSessions = new Set<string>();
  private readonly sessionLogs = new Map<string, InstallLogItem[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly runtimeService: RuntimeService
  ) {}

  async createSession(): Promise<InstallSessionStatus> {
    const created = await this.prisma.install_sessions.create({
      data: {
        state: 'INIT',
        progress: this.getProgress('INIT'),
        message: '安装会话已创建',
        logs: [] as unknown as never[],
        error_message: null
      }
    });

    this.sessionLogs.set(created.id, []);
    return this.mapSession(created, []);
  }

  async getStatus(id: string): Promise<InstallSessionStatus> {
    const session = await this.prisma.install_sessions.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException(`未找到安装会话: ${id}`);
    }

    const logs = this.resolveLogs(id, session.logs);
    return this.mapSession(session, logs);
  }

  async start(id: string): Promise<InstallSessionStatus> {
    const session = await this.prisma.install_sessions.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException(`未找到安装会话: ${id}`);
    }

    if (!this.runningSessions.has(id) && session.state !== 'DONE') {
      this.runningSessions.add(id);
      void this.runInstallFlow(id);
    }

    return this.getStatus(id);
  }

  private async runInstallFlow(sessionId: string): Promise<void> {
    const logListener = (event: 运行日志事件, stage: InstallState) => {
      void this.appendSessionLog(sessionId, event, stage);
    };

    const spawner = new ProcessSpawner((event: 运行日志事件) => {
      void this.appendSessionLog(sessionId, event, 'CHECK_ENV');
    });
    const dependencyChecker = new DependencyChecker(spawner);
    const installer = new OpenClawInstaller(spawner);

    try {
      const ctx = this.runtimeService.getRuntimeContext();

      await this.transition(sessionId, 'CHECK_OS');
      if (ctx.platform !== 'win32' && ctx.platform !== 'darwin') {
        throw new Error(`当前平台 ${ctx.platform} 暂不支持安装`);
      }
      await this.appendSessionLog(
        sessionId,
        {
          timestamp: new Date().toISOString(),
          source: 'dependency-checker',
          level: 'info',
          message: `系统平台检测通过: ${ctx.platform}`
        },
        'CHECK_OS'
      );

      await this.transition(sessionId, 'CHECK_ENV');
      const dependencyResult = await dependencyChecker.check(ctx, (event: 运行日志事件) => {
        logListener(event, 'CHECK_ENV');
      });
      if (!dependencyResult.osSupported || !dependencyResult.nodeOk || !dependencyResult.shellOk) {
        throw new Error('环境依赖检查未通过，请确认 Node、PowerShell/Bash 可用后重试');
      }

      await this.transition(sessionId, 'INSTALL_OPENCLAW');
      await installer.install(ctx, (event: 运行日志事件) => {
        logListener(event, 'INSTALL_OPENCLAW');
      });

      await this.transition(sessionId, 'START_GATEWAY');
      await this.runtimeService.start({ installSessionId: sessionId });

      await this.transition(sessionId, 'HEALTH_CHECK');
      const healthy = await this.runtimeService.checkGatewayHealth();
      if (!healthy) {
        throw new Error('Gateway 健康检查失败');
      }

      await this.transition(sessionId, 'DONE');
      await this.appendSessionLog(
        sessionId,
        {
          timestamp: new Date().toISOString(),
          source: 'installer',
          level: 'info',
          message: '安装流程执行完成'
        },
        'DONE'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`安装会话失败(${sessionId}): ${message}`);
      await this.markFailed(sessionId, message);
    } finally {
      this.runningSessions.delete(sessionId);
    }
  }

  private async transition(id: string, state: InstallState): Promise<void> {
    const step = INSTALL_STEPS.find((item) => item.state === state);
    await this.prisma.install_sessions.update({
      where: { id },
      data: {
        state,
        progress: this.getProgress(state),
        message: step?.message ?? state,
        error_message: null
      }
    });
  }

  private async markFailed(id: string, errorMessage: string): Promise<void> {
    await this.prisma.install_sessions.update({
      where: { id },
      data: {
        state: 'INSTALL_FAILED',
        message: '安装失败，请检查日志后重试',
        error_message: errorMessage
      }
    });

    await this.appendSessionLog(
      id,
      {
        timestamp: new Date().toISOString(),
        source: 'installer',
        level: 'error',
        message: errorMessage
      },
      'INSTALL_FAILED'
    );
  }

  private async appendSessionLog(
    sessionId: string,
    event: 运行日志事件,
    stage: InstallState
  ): Promise<void> {
    const logs = [...(this.sessionLogs.get(sessionId) ?? [])];
    logs.push({
      timestamp: event.timestamp,
      source: event.source,
      level: event.level,
      message: event.message
    });

    const slicedLogs = logs.slice(-500);
    this.sessionLogs.set(sessionId, slicedLogs);

    await this.prisma.install_sessions.update({
      where: { id: sessionId },
      data: { logs: slicedLogs as unknown as never[] }
    });

    await this.prisma.runtime_logs.create({
      data: {
        source: event.source,
        level: event.level,
        stage,
        message: event.message,
        install_session_id: sessionId
      }
    });
  }

  private resolveLogs(sessionId: string, rawLogs: unknown): InstallLogItem[] {
    if (this.sessionLogs.has(sessionId)) {
      return this.sessionLogs.get(sessionId) ?? [];
    }

    if (!Array.isArray(rawLogs)) {
      this.sessionLogs.set(sessionId, []);
      return [];
    }

    const logs = rawLogs
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const log = item as Record<string, unknown>;
        const level = log.level;
        if (level !== 'info' && level !== 'warn' && level !== 'error') {
          return null;
        }

        return {
          timestamp: String(log.timestamp ?? new Date().toISOString()),
          source: String(log.source ?? 'installer'),
          level,
          message: String(log.message ?? '')
        } satisfies InstallLogItem;
      })
      .filter((item): item is InstallLogItem => item !== null);

    this.sessionLogs.set(sessionId, logs);
    return logs;
  }

  private mapSession(
    session: {
      id: string;
      state: string;
      progress: number;
      message: string;
      logs: unknown;
      updated_at: Date;
      error_message: string | null;
    },
    logs: InstallLogItem[]
  ): InstallSessionStatus {
    const safeState = this.normalizeState(session.state);
    return {
      id: session.id,
      state: safeState,
      progress: session.progress,
      message: session.message,
      logs,
      updatedAt: session.updated_at.toISOString(),
      errorMessage: session.error_message ?? undefined
    };
  }

  private normalizeState(state: string): InstallState {
    const matched = INSTALL_STEPS.find((item) => item.state === state)?.state;
    if (matched) {
      return matched;
    }
    return state === 'INSTALL_FAILED' ? 'INSTALL_FAILED' : 'INIT';
  }

  private getProgress(state: InstallState): number {
    const index = INSTALL_STEPS.findIndex((item) => item.state === state);
    if (index <= 0) {
      return 0;
    }
    return Math.round((index / (INSTALL_STEPS.length - 1)) * 100);
  }
}
